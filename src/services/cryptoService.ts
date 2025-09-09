// services/cryptoService.ts
import { toast } from "@/hooks/use-toast"

export interface EncryptionMetadata {
  algorithm: string;
  salt: string;
  iv: string;
  iterations: number;
  keyDerivation: string;
}

export interface EncryptionResult {
  encryptedBlob: Blob;
  metadata: EncryptionMetadata;
  originalType: string;
}

export class CryptoService {
  /**
   * Criptografa um arquivo usando a senha do usuário.
   * A saída inclui o blob criptografado e metadados necessários para a descriptografia.
   */
  static async encryptFile(file: File, password: string): Promise<{
    encryptedBlob: Blob,
    iv: string,
    metadata: {
      algorithm: string,
      salt: string,
      iterations: number
    }
  }> {
    try {
      const encoder = new TextEncoder()
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      )

      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'] // Adicionado 'decrypt' para a chave ser usável na descriptografia
      )

      const fileBuffer = await file.arrayBuffer()
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        fileBuffer
      )

      // Combinar salt + iv + dados criptografados
      // Isso é opcional, mas pode simplificar o armazenamento de um único blob
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
      combined.set(salt, 0)
      combined.set(iv, salt.length)
      combined.set(new Uint8Array(encrypted), salt.length + iv.length)

      return {
        encryptedBlob: new Blob([new Uint8Array(encrypted)], { type: 'application/octet-stream' }),
        iv: btoa(String.fromCharCode(...iv)),
        metadata: {
          algorithm: 'AES-GCM-256',
          salt: btoa(String.fromCharCode(...salt)),
          iterations: 100000
        }
      }

    } catch (error) {
      toast({ title: "Erro na criptografia", variant: "destructive" })
      throw error
    }
  }

  /**
   * Descriptografa um ArrayBuffer criptografado usando a senha do usuário e metadados.
   */
  static async decryptFile(
    encryptedBuffer: ArrayBuffer,
    password: string,
    metadata: { algorithm: string, salt: string, iterations: number, iv: string }
  ): Promise<Blob> {
    try {
      const encoder = new TextEncoder()
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      )

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: Uint8Array.from(atob(metadata.salt), c => c.charCodeAt(0)),
          iterations: metadata.iterations,
          hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      )

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: Uint8Array.from(atob(metadata.iv), c => c.charCodeAt(0)) },
        key,
        encryptedBuffer
      )

      return new Blob([decrypted])
    } catch (error) {
      toast({
        title: "Erro na descriptografia",
        description: "Senha ou arquivo inválido.",
        variant: "destructive"
      })
      throw error
    }
  }
}