#!/usr/bin/env python3
"""
Gera a série histórica de focos de calor da Caatinga a partir dos arquivos oficiais
anuais do INPE (satélite de referência) e grava em src/data/serie-focos-inpe.json.

Uso (na pasta do projeto, com internet):
    python scripts/gerar_serie_focos.py            # 2003 até o ano atual
    python scripts/gerar_serie_focos.py 2015 2025  # intervalo
Só usa a biblioteca padrão do Python 3. Baixa cerca de 3 a 10 MB por ano.
"""
import csv, io, json, re, sys, tempfile, unicodedata, urllib.request, zipfile
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path

BASE = "https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/anual/Brasil_sat_ref/focos_br_ref_{ano}.zip"
SAIDA = Path(__file__).resolve().parent.parent / "src" / "data" / "serie-focos-inpe.json"


def norm(texto):
    texto = unicodedata.normalize("NFD", texto or "")
    return "".join(c for c in texto if unicodedata.category(c) != "Mn").strip().lower()


def contar_csv(fluxo):
    """Conta focos da Caatinga por mês em um CSV do INPE. Retorna (Counter 'MM', total_linhas)."""
    leitor = csv.reader(io.TextIOWrapper(fluxo, encoding="utf-8", errors="replace", newline=""))
    cabecalho = [norm(c) for c in next(leitor)]
    i_bioma = next((i for i, c in enumerate(cabecalho) if "bioma" in c), None)
    i_data = next((i for i, c in enumerate(cabecalho) if c.startswith("data")), None)
    if i_bioma is None or i_data is None:
        raise SystemExit(f"Colunas não encontradas no CSV. Cabeçalho: {cabecalho}")
    meses, total = Counter(), 0
    for linha in leitor:
        total += 1
        if len(linha) <= max(i_bioma, i_data) or norm(linha[i_bioma]) != "caatinga":
            continue
        m = re.search(r"\d{4}[-/](\d{2})", linha[i_data]) or re.search(r"\d{2}/(\d{2})/\d{4}", linha[i_data])
        if m:
            meses[m.group(1)] += 1
    return meses, total


def processar_zip(caminho):
    with zipfile.ZipFile(caminho) as z:
        nome = next(n for n in z.namelist() if n.lower().endswith(".csv"))
        with z.open(nome) as f:
            return contar_csv(f)


def main():
    args = [int(a) for a in sys.argv[1:3]]
    inicio = args[0] if args else 2003
    fim = args[1] if len(args) > 1 else date.today().year
    serie, mensal_total = [], Counter()
    for ano in range(inicio, fim + 1):
        url = BASE.format(ano=ano)
        print(f"{ano}: baixando…", end=" ", flush=True)
        try:
            with tempfile.NamedTemporaryFile(suffix=".zip") as tmp:
                with urllib.request.urlopen(url, timeout=120) as r:
                    tmp.write(r.read())
                tmp.flush()
                meses, total = processar_zip(tmp.name)
        except Exception as erro:
            print(f"falhou ({erro}); ano ignorado")
            continue
        valor = sum(meses.values())
        print(f"{valor} focos na Caatinga (de {total} no Brasil)")
        serie.append({"ano": ano, "valor": valor, "parcial": ano == date.today().year})
        mensal_total.update(meses if ano < date.today().year else {})
    if not serie:
        raise SystemExit("Nenhum ano foi baixado. Verifique a internet e tente de novo.")
    saida = {
        "fonte": "INPE, Programa Queimadas, focos de calor, satélite de referência (bioma Caatinga)",
        "url": "https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/anual/Brasil_sat_ref/",
        "geradoEm": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "serie": serie,
        "mensal": [{"mes": int(m), "valor": mensal_total.get(f"{m:02d}", 0)} for m in range(1, 13)],
        "mensalPeriodo": [serie[0]["ano"], max(s["ano"] for s in serie if not s["parcial"]) if any(not s["parcial"] for s in serie) else serie[-1]["ano"]],
    }
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nGravado em {SAIDA}. Rode npm run dev para ver o gráfico atualizado.")


if __name__ == "__main__":
    main()
