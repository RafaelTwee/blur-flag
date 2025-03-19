from flask import Flask, render_template
import sqlite3
import datetime
import random

app = Flask(__name__)

def get_daily_flag():
    # Conectando ao banco de dados
    conn = sqlite3.connect('bandeiras.db')
    cursor = conn.cursor()

    # Obtendo todas as bandeiras
    cursor.execute('SELECT nome, url FROM bandeiras')
    bandeiras = cursor.fetchall()

    # Obtendo a data atual
    hoje = datetime.date.today()

    # Usando a data como semente para gerar um índice aleatório
    random.seed(hoje.toordinal())
    indice = random.randint(0, len(bandeiras) - 1)

    # Selecionando a bandeira do dia
    bandeira_do_dia = bandeiras[indice]

    conn.close()
    return bandeira_do_dia

@app.route('/')
def index():
    bandeira = get_daily_flag()
    return render_template('index.html', bandeira=bandeira)

if __name__ == '__main__':
    app.run(debug=True)
