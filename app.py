from flask import Flask, render_template, session, jsonify, request
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

def get_random_flag():
    # Conectando ao banco de dados
    conn = sqlite3.connect('bandeiras.db')
    cursor = conn.cursor()

    # Obtendo todas as bandeiras
    cursor.execute('SELECT nome, url FROM bandeiras')
    bandeiras = cursor.fetchall()

    # Selecionando uma bandeira aleatória
    bandeira_aleatoria = random.choice(bandeiras)

    conn.close()
    return bandeira_aleatoria

def get_all_countries():
    # Conectando ao banco de dados
    conn = sqlite3.connect('bandeiras.db')
    cursor = conn.cursor()

    # Obtendo todos os nomes de países
    cursor.execute('SELECT nome FROM bandeiras ORDER BY nome')
    paises = [row[0] for row in cursor.fetchall()]

    conn.close()
    return paises

@app.route('/')
def index():
    bandeira = get_daily_flag()
    # Verificar se o usuário já acertou hoje
    data_hoje = datetime.date.today().strftime('%Y-%m-%d')
    acertou_hoje = session.get('acertou_' + data_hoje, False)
    
    return render_template('index.html', bandeira=bandeira, acertou_hoje=acertou_hoje)

@app.route('/paises')
def paises():
    # Retorna a lista de países em formato JSON para autocomplete
    return jsonify(get_all_countries())

@app.route('/acertou')
def acertou():
    # Marcar que o usuário acertou hoje
    data_hoje = datetime.date.today().strftime('%Y-%m-%d')
    session['acertou_' + data_hoje] = True
    return '', 204  # Resposta vazia com código 204 (No Content)

@app.route('/proxima_bandeira', methods=['POST'])
def proxima_bandeira():
    # Endpoint para mudar a bandeira (apenas para testes)
    bandeira = get_random_flag()
    return jsonify({'nome': bandeira[0], 'url': bandeira[1]})

if __name__ == '__main__':
    app.run(debug=True)