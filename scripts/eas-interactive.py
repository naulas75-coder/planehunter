"""Ejecuta `eas build` en modo interactivo dentro de GitHub Actions.

La primera vez EAS solo crea el perfil de Apple si puede preguntar. Este script simula un terminal
y acepta cada pregunta con la opción por defecto (Enter). La clave de App Store Connect
(EXPO_ASC_*) se usa como login de Apple.
"""
import os
import sys
import time

import pexpect

env = dict(os.environ)
env.pop("CI", None)  # Con CI=true EAS fuerza el modo no interactivo.
env.pop("GITHUB_ACTIONS", None)

child = pexpect.spawn(
    "eas",
    ["build", "--platform", "ios", "--profile", "production", "--no-wait"],
    env=env,
    encoding="utf-8",
    timeout=600,
    dimensions=(40, 200),
)
child.logfile_read = sys.stdout

answers = 0
while True:
    i = child.expect([r"\?.*(\(Y/n\)|\(y/N\)|›|❯|Select|Choose)", pexpect.EOF, pexpect.TIMEOUT])
    if i == 0:
        answers += 1
        if answers > 25:
            print("\nDemasiadas preguntas; se para.")
            child.terminate(force=True)
            sys.exit(1)
        time.sleep(1.5)
        child.send("\r")
    elif i == 1:
        break
    else:
        print("\nSin respuesta de EAS en 10 minutos.")
        child.terminate(force=True)
        sys.exit(1)

child.close()
sys.exit(child.exitstatus or 0)
