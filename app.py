from flask import Flask, render_template, session
import sqlite3
import datetime
import random
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Chave para gerenciar sessões

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
    # Verificar se o usuário já acertou hoje
    data_hoje = datetime.date.today().strftime('%Y-%m-%d')
    acertou_hoje = session.get('acertou_' + data_hoje, False)
    
    return render_template('index.html', bandeira=bandeira, acertou_hoje=acertou_hoje)

@app.route('/acertou')
def acertou():
    # Marcar que o usuário acertou hoje
    data_hoje = datetime.date.today().strftime('%Y-%m-%d')
    session['acertou_' + data_hoje] = True
    return '', 204  # Resposta vazia com código 204 (No Content)

if __name__ == '__main__':
    app.run(debug=True)