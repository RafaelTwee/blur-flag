import requests
import sqlite3

# URL da API de bandeiras
a = 'https://restcountries.com/v3.1/all'

def atualizar_banco():
    response = requests.get(a)
    countries = response.json()

    # Conectando ao banco de dados SQLite
    conn = sqlite3.connect('bandeiras.db')
    cursor = conn.cursor()

    # Criando a tabela se não existir
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bandeiras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            url TEXT
        )
    ''')

    # Limpando a tabela existente
    cursor.execute('DELETE FROM bandeiras')

    # Inserindo os dados no banco de dados
    for country in countries:
        nome = country['name']['common']
        url = country['flags']['png']
        cursor.execute('INSERT INTO bandeiras (nome, url) VALUES (?, ?)', (nome, url))

    # Salvando e fechando a conexão
    conn.commit()
    conn.close()

if __name__ == "__main__":
    atualizar_banco()
    print("Banco de dados atualizado com sucesso!")
