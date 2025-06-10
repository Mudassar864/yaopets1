/**
 * Utilitário para converter URLs de Blob temporárias em armazenamento permanente
 * Este módulo resolve o problema de imagens no feed que usam URLs de blob temporárias
 * convertendo-as em arquivos permanentemente armazenados no servidor
 */

/**
 * Converte uma URL de blob em um URL permanente no servidor
 * @param blobUrl A URL de blob a ser convertida
 * @returns Uma Promise com a URL permanente ou a URL original em caso de falha
 */
export async function convertBlobToPermStorage(blobUrl: string): Promise<string> {
  // Se já não for uma URL de blob, retornar a URL original
  if (!blobUrl.startsWith('blob:')) {
    return blobUrl;
  }
  
  try {
    // Verificar se estamos em ambiente de navegador
    if (typeof window === 'undefined') {
      console.log("Ambiente não suporta blob - retornando URL original");
      return blobUrl;
    }
    
    // Buscar o blob de forma segura
    let uploadResponse = null;
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      
      // Criar um arquivo a partir do blob
      const file = new File([blob], `post-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Criar FormData para o upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Fazer upload para o servidor usando o conversor de blob dedicado
      uploadResponse = await fetch('/api/blob-converter', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
    } catch (fetchError) {
      console.error("Erro ao acessar blob URL:", fetchError);
      return blobUrl; // Retornar URL original em caso de erro
    }
    
    if (uploadResponse && uploadResponse.ok) {
      const result = await uploadResponse.json();
      if (result.url || result.mediaUrl) {
        console.log("Imagem convertida para armazenamento permanente:", result.url || result.mediaUrl);
        return result.url || result.mediaUrl;
      }
    }
    
    throw new Error('Falha ao converter blob para armazenamento permanente');
  } catch (error) {
    console.error("Erro ao converter imagem blob para armazenamento permanente:", error);
    // Em caso de erro, retornar a URL original (que ainda funciona temporariamente)
    return blobUrl;
  }
}

/**
 * Converte várias URLs de blob em URLs permanentes
 * @param mediaUrls Array de URLs a serem convertidas
 * @returns Promise com array de URLs permanentes (ou originais em caso de falha)
 */
export async function convertMediaUrlsToPermStorage(mediaUrls: string[]): Promise<string[]> {
  if (!mediaUrls || !Array.isArray(mediaUrls) || mediaUrls.length === 0) {
    return [];
  }
  
  // Processar cada URL em paralelo
  const conversionPromises = mediaUrls.map(async (url) => {
    if (url && typeof url === 'string' && url.startsWith('blob:')) {
      return convertBlobToPermStorage(url);
    }
    return url;
  });
  
  return Promise.all(conversionPromises);
}