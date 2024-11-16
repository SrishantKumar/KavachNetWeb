import CryptoJS from 'crypto-js';

export interface EncryptionKey {
  id: string;
  key: string;
  algorithm: 'AES' | 'DES' | 'RC4';
  createdAt: number;
  createdBy: string;
}

export interface EncryptedMessage {
  ciphertext: string;
  keyId: string;
  algorithm: string;
  iv: string;
}

class EncryptionService {
  private static generateIV(): string {
    return CryptoJS.lib.WordArray.random(16).toString();
  }

  static async encrypt(
    message: string,
    key: EncryptionKey
  ): Promise<EncryptedMessage> {
    try {
      const iv = this.generateIV();
      let ciphertext: string;

      switch (key.algorithm) {
        case 'AES':
          ciphertext = CryptoJS.AES.encrypt(message, key.key, {
            iv: CryptoJS.enc.Hex.parse(iv),
          }).toString();
          break;
        case 'DES':
          ciphertext = CryptoJS.DES.encrypt(message, key.key, {
            iv: CryptoJS.enc.Hex.parse(iv),
          }).toString();
          break;
        case 'RC4':
          ciphertext = CryptoJS.RC4.encrypt(message, key.key).toString();
          break;
        default:
          throw new Error('Unsupported encryption algorithm');
      }

      return {
        ciphertext,
        keyId: key.id,
        algorithm: key.algorithm,
        iv,
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  static async decrypt(
    encryptedMessage: EncryptedMessage,
    key: EncryptionKey
  ): Promise<string> {
    try {
      if (key.id !== encryptedMessage.keyId) {
        throw new Error('Invalid encryption key');
      }

      let decrypted: string;

      switch (encryptedMessage.algorithm) {
        case 'AES':
          decrypted = CryptoJS.AES.decrypt(encryptedMessage.ciphertext, key.key, {
            iv: CryptoJS.enc.Hex.parse(encryptedMessage.iv),
          }).toString(CryptoJS.enc.Utf8);
          break;
        case 'DES':
          decrypted = CryptoJS.DES.decrypt(encryptedMessage.ciphertext, key.key, {
            iv: CryptoJS.enc.Hex.parse(encryptedMessage.iv),
          }).toString(CryptoJS.enc.Utf8);
          break;
        case 'RC4':
          decrypted = CryptoJS.RC4.decrypt(
            encryptedMessage.ciphertext,
            key.key
          ).toString(CryptoJS.enc.Utf8);
          break;
        default:
          throw new Error('Unsupported encryption algorithm');
      }

      if (!decrypted) {
        throw new Error('Decryption failed');
      }

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  static async analyzeEncryption(
    encryptedMessage: EncryptedMessage
  ): Promise<{
    algorithm: string;
    strength: 'weak' | 'medium' | 'strong';
    patterns: string[];
  }> {
    const patterns: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'medium';

    // Analyze encryption patterns
    const { ciphertext, algorithm } = encryptedMessage;
    const ciphertextLength = ciphertext.length;

    // Check for common patterns
    if (ciphertextLength < 32) {
      patterns.push('Short ciphertext length - potentially weak encryption');
      strength = 'weak';
    }

    // Analyze algorithm strength
    switch (algorithm) {
      case 'AES':
        strength = 'strong';
        patterns.push('AES encryption - industry standard');
        break;
      case 'DES':
        strength = 'weak';
        patterns.push('DES encryption - considered deprecated');
        break;
      case 'RC4':
        strength = 'medium';
        patterns.push('RC4 encryption - potential vulnerabilities');
        break;
    }

    // Check for repeating patterns
    const chunks = ciphertext.match(/.{1,16}/g) || [];
    const uniqueChunks = new Set(chunks);
    if (chunks.length > uniqueChunks.size * 2) {
      patterns.push('Repeating patterns detected - possible weak encryption mode');
      strength = 'weak';
    }

    return {
      algorithm,
      strength,
      patterns,
    };
  }

  static generateKey(
    userId: string,
    algorithm: 'AES' | 'DES' | 'RC4' = 'AES'
  ): EncryptionKey {
    const keySize = algorithm === 'AES' ? 32 : 16; // 256 bits for AES, 128 bits for others
    const key = CryptoJS.lib.WordArray.random(keySize).toString();

    return {
      id: `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      key,
      algorithm,
      createdAt: Date.now(),
      createdBy: userId,
    };
  }
}

export default EncryptionService;
