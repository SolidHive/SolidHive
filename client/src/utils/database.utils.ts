import api from './api.utils';

export default class Database {
  /**
   * -- General CRUD
   */
  static async getAll(collection: string, params?: object) {
    try {
      const response = await api.get(`/${collection}`, { params });
      return response.data;
    } catch (err: unknown) {
      console.error('API Error in Database.getAll:', err);
      throw err;
    }
  }

  static async getOne(collection: string, id: string, params?: object) {
    try {
      const response = await api.get(`/${collection}/${id}`, { params });
      return response.data;
    } catch (err: unknown) {
      console.error('API Error in Database.getOne:', err);
      throw err;
    }
  }

  static async create(collection: string, item: object) {
    try {
      const response = await api.post(`/${collection}`, item);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (err: unknown) {
      console.error('API Error in Database.create:', err);
      throw err;
    }
  }

  static async update(collection: string, id: string, item: object) {
    try {
      const response = await api.patch(`/${collection}/${id}`, item);
      return response.data;
    } catch (err: unknown) {
      console.error('API Error in Database.update:', err);
      throw err;
    }
  }

  static async patch(collection: string, item?: object, params?: object) {
    try {
      const response = await api.patch(`/${collection}`, item, {
        params,
      });
      return response.data;
    } catch (err: unknown) {
      console.error('API Error in Database.patch:', err);
      throw err;
    }
  }

  static async delete(collection: string) {
    try {
      const { status } = await api.delete(`/${collection}`);
      return status;
    } catch (err: unknown) {
      console.error('API Error in Database.delete:', err);
      throw err;
    }
  }

  /**
   * Upload un fichier avec FormData
   * @param file Le fichier à uploader
   * @param data Les données du DTO CreateFileDto (relatedTo, relatedBy, purpose, index, etc.)
   */
  static async uploadFile(
    file: File,
    data: {
      relatedTo: string;
      relatedBy: string;
      purpose: string;
      index?: number;
      allowedSystemRoles?: number[];
      allowedAssociationRoles?: string[];
    }
  ) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('relatedTo', data.relatedTo);
      formData.append('relatedBy', data.relatedBy);
      formData.append('purpose', data.purpose);
      formData.append('index', String(data.index ?? 0));

      if (data.allowedSystemRoles) {
        formData.append('allowedSystemRoles', data.allowedSystemRoles.join(','));
      }

      if (data.allowedAssociationRoles) {
        formData.append('allowedAssociationRoles', data.allowedAssociationRoles.join(','));
      }

      const response = await api.post('files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err: unknown) {
      console.error('API Error in Database.uploadFile:', err);
      throw err;
    }
  }

  /**
   * Met à jour ou crée un fichier (écrase l'ancien si existe)
   * Note: Grâce à la contrainte unique sur [relatedTo, relatedBy, index, purpose],
   * créer un fichier avec les mêmes paramètres écrasera l'ancien
   */
  static async updateFile(
    file: File,
    data: {
      relatedTo: string;
      relatedBy: string;
      purpose: string;
      index?: number;
      allowedSystemRoles?: number[];
      allowedAssociationRoles?: string[];
    }
  ) {
    // Pour mettre à jour, on supprime d'abord l'ancien fichier puis on crée le nouveau
    try {
      // Supprimer l'ancien fichier s'il existe (en spécifiant le purpose pour ne supprimer que le bon fichier)
      await api.delete(
        `files/${data.relatedTo}/${data.relatedBy}?index=${data.index ?? 0}&purpose=${data.purpose}`
      );
    } catch (err) {
      console.warn('Aucun fichier existant à supprimer ou erreur lors de la suppression:', err);
    }

    // Créer le nouveau fichier
    return this.uploadFile(file, data);
  }

  /**
   * Télécharge un fichier depuis une URL de l'API
   * @param path Le chemin de l'API (ex: 'invoices/transaction/123')
   * @returns Un Blob du fichier téléchargé
   */
  static async downloadFile(path: string): Promise<Blob> {
    try {
      const response = await api.get(path, {
        responseType: 'blob',
      });
      return response.data;
    } catch (err: unknown) {
      console.error('API Error in Database.downloadFile:', err);
      throw err;
    }
  }
}
