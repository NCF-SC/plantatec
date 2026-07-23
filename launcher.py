"""
Plantatec — launcher desktop (WebView2).
Exportação via diálogo nativo + trava de usos.
"""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

# --- Configuração da licença (altere conforme necessário) ---
MAX_USES = 1000
# Senha para liberar o app após atingir o limite:
ACTIVATION_PASSWORD = "Plantatec-Liberar"
# ----------------------------------------------------------

ACTIVATION_HASH = hashlib.sha256(
    ACTIVATION_PASSWORD.encode("utf-8")
).hexdigest()

# Garante coleta pelo PyInstaller (SVG → PDF)
try:
    from reportlab.graphics import renderPDF as _rl_renderPDF  # noqa: F401
    from svglib.svglib import svg2rlg as _svg2rlg  # noqa: F401
except ImportError:
    pass


def bundle_dir() -> Path:
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS) / "pack"
    return Path(__file__).resolve().parent / "pack"


def license_path() -> Path:
    base = Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local")
    folder = base / "Plantatec"
    folder.mkdir(parents=True, exist_ok=True)
    return folder / "license.json"


def load_license() -> dict:
    path = license_path()
    if not path.exists():
        return {"uses": 0, "unlocked": False}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return {
            "uses": int(data.get("uses") or 0),
            "unlocked": bool(data.get("unlocked")),
        }
    except Exception:
        return {"uses": 0, "unlocked": False}


def save_license(data: dict) -> None:
    license_path().write_text(
        json.dumps(
            {"uses": int(data.get("uses") or 0), "unlocked": bool(data.get("unlocked"))},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


def license_status(data: dict | None = None) -> dict:
    d = data if data is not None else load_license()
    uses = max(0, int(d.get("uses") or 0))
    unlocked = bool(d.get("unlocked"))
    remaining = max(0, MAX_USES - uses) if not unlocked else None
    blocked = (not unlocked) and uses >= MAX_USES
    return {
        "unlocked": unlocked,
        "uses": uses,
        "max_uses": MAX_USES,
        "remaining": remaining,
        "blocked": blocked,
    }


class Api:
    def get_license(self) -> dict:
        return license_status()

    def register_use(self) -> dict:
        """Conta um uso (chamado após exportação bem-sucedida)."""
        data = load_license()
        if data.get("unlocked"):
            return license_status(data)
        status = license_status(data)
        if status["blocked"]:
            return status
        data["uses"] = int(data.get("uses") or 0) + 1
        save_license(data)
        return license_status(data)

    def activate(self, password: str) -> dict:
        pwd = (password or "").strip()
        digest = hashlib.sha256(pwd.encode("utf-8")).hexdigest()
        if digest != ACTIVATION_HASH:
            return {"ok": False, "message": "Senha incorreta.", **license_status()}
        data = load_license()
        data["unlocked"] = True
        save_license(data)
        return {"ok": True, "message": "App liberado com sucesso.", **license_status(data)}

    def _save_dialog(self, suggested_name: str, file_types: tuple[str, ...]):
        import webview

        window = webview.windows[0] if webview.windows else None
        if window is None:
            return None
        result = window.create_file_dialog(
            webview.SAVE_DIALOG,
            save_filename=suggested_name,
            file_types=file_types,
        )
        if not result:
            return None
        return result if isinstance(result, str) else result[0]

    def save_svg(self, content: str, suggested_name: str = "planta.svg") -> dict:
        """Salva SVG. Retorna {ok, blocked?, cancelled?}."""
        status = license_status()
        if status["blocked"]:
            return {"ok": False, "blocked": True, **status}

        path = self._save_dialog(suggested_name or "planta.svg", ("SVG (*.svg)",))
        if not path:
            return {"ok": False, "blocked": False, "cancelled": True, **status}

        Path(path).write_text(content, encoding="utf-8")
        new_status = self.register_use()
        return {"ok": True, "blocked": False, "cancelled": False, **new_status}

    def save_pdf(self, content: str, suggested_name: str = "planta.pdf") -> dict:
        """Converte SVG → PDF e salva. Conta uso após sucesso."""
        status = license_status()
        if status["blocked"]:
            return {"ok": False, "blocked": True, **status}

        path = self._save_dialog(suggested_name or "planta.pdf", ("PDF (*.pdf)",))
        if not path:
            return {"ok": False, "blocked": False, "cancelled": True, **status}

        try:
            from reportlab.graphics import renderPDF
            from svglib.svglib import svg2rlg
        except ImportError:
            return {
                "ok": False,
                "blocked": False,
                "cancelled": False,
                "message": "Recurso PDF indisponível neste instalador.",
                **status,
            }

        fd, tmp_name = tempfile.mkstemp(suffix=".svg", prefix="plantatec_")
        os.close(fd)
        tmp_svg = Path(tmp_name)
        try:
            tmp_svg.write_text(content, encoding="utf-8")
            drawing = svg2rlg(str(tmp_svg))
            if drawing is None:
                return {
                    "ok": False,
                    "blocked": False,
                    "cancelled": False,
                    "message": "Falha ao converter SVG em PDF.",
                    **status,
                }
            out = path if str(path).lower().endswith(".pdf") else f"{path}.pdf"
            renderPDF.drawToFile(drawing, out)
        except Exception as exc:
            return {
                "ok": False,
                "blocked": False,
                "cancelled": False,
                "message": f"Erro ao gerar PDF: {exc}",
                **status,
            }
        finally:
            tmp_svg.unlink(missing_ok=True)

        new_status = self.register_use()
        return {"ok": True, "blocked": False, "cancelled": False, **new_status}


def main() -> None:
    src = bundle_dir()
    work = Path(tempfile.mkdtemp(prefix="plantatec_"))
    try:
        for name in ("index.html", "styles.css", "app.js"):
            shutil.copy2(src / name, work / name)
        for folder in ("fonts", "vendor"):
            src_dir = src / folder
            if src_dir.is_dir():
                shutil.copytree(src_dir, work / folder, dirs_exist_ok=True)

        index = (work / "index.html").as_uri()
        api = Api()

        import webview

        webview.create_window(
            "Plantatec — Planta Técnica",
            url=index,
            js_api=api,
            width=1280,
            height=860,
            min_size=(900, 600),
        )
        webview.start()
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main()
