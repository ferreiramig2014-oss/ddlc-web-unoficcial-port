#!/usr/bin/env python3
import os
import sys

def split_file(input_file, chunk_size_mb=20):
    """Divide arquivo em pedaços de X MB"""
    chunk_size = chunk_size_mb * 1024 * 1024
    
    if not os.path.exists(input_file):
        print(f"Erro: {input_file} não encontrado")
        return
    
    file_size = os.path.getsize(input_file)
    num_chunks = (file_size + chunk_size - 1) // chunk_size
    
    print(f"Dividindo {input_file} ({file_size / 1024 / 1024:.1f}MB) em {num_chunks} pedaços...")
    
    with open(input_file, 'rb') as f:
        for i in range(num_chunks):
            chunk = f.read(chunk_size)
            chunk_name = f"{input_file}.part{i+1}"
            with open(chunk_name, 'wb') as out:
                out.write(chunk)
            print(f"  [OK] {chunk_name} ({len(chunk) / 1024 / 1024:.1f}MB)")
    
    print(f"\n[OK] Divisao concluida! Total: {num_chunks} pedacos")
    print(f"\nProximas passos:")
    print(f"1. Copia TODOS os game.zip.partN pra pasta do repositório")
    print(f"2. Remove o game.zip original")
    print(f"3. git add .")
    print(f"4. git commit -m 'Split game.zip for GitHub Pages'")
    print(f"5. git push")

if __name__ == '__main__':
    split_file('game.zip', chunk_size_mb=20)
