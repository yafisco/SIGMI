// Hook personnalisé pour centraliser la logique de suppression avec SweetAlert
// Réutilisable dans toutes les pages qui ont une fonctionnalité de suppression

import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';

interface UseDeleteOptions {
  entityName: string; // ex: "le client", "l'opportunité", "la tâche"
  onSuccess: () => void; // Callback après suppression réussie
  deleteFn: (id: string) => Promise<void>; // Fonction de suppression du service
}

/**
 * Hook pour gérer la suppression avec confirmation SweetAlert
 * @param options - Options de configuration
 * @returns Fonction handleDelete à utiliser dans les composants
 */
export function useDelete(options: UseDeleteOptions) {
  const { entityName, onSuccess, deleteFn } = options;

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer ${entityName} "${name}". Cette action est irréversible !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
      cancelButtonColor: SWEETALERT_CONFIG.cancelButtonColor,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      customClass: SWEETALERT_CONFIG.customClass,
    });

    if (result.isConfirmed) {
      try {
        await deleteFn(id);
        onSuccess();

        await Swal.fire({
          title: 'Supprimé !',
          text: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} a été supprimé avec succès.`,
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (err: any) {
        await Swal.fire({
          title: 'Erreur',
          text: err.message || `Erreur lors de la suppression de ${entityName}`,
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  return handleDelete;
}
