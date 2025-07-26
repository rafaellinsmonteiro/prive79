
import { useChatSettings } from './useChatSettings';

const DISGUISE_DATA = {
  women: {
    names: [
      'Ana Silva', 'Maria Santos', 'Julia Costa', 'Carla Oliveira', 'Fernanda Lima',
      'Beatriz Alves', 'Camila Rocha', 'Daniela Martins', 'Gabriela Souza', 'Isabela Cruz',
      'Larissa Dias', 'Mariana Pereira', 'Natália Ferreira', 'Patrícia Gomes', 'Renata Barbosa',
      'Sara Nascimento', 'Tatiana Ribeiro', 'Vanessa Campos', 'Viviane Moreira', 'Yara Cardoso'
    ],
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face'
    ]
  },
  men: {
    names: [
      'João Silva', 'Pedro Santos', 'Lucas Costa', 'Carlos Oliveira', 'Fernando Lima',
      'Bruno Alves', 'Rafael Rocha', 'Daniel Martins', 'Gabriel Souza', 'Thiago Cruz',
      'André Dias', 'Marcelo Pereira', 'Ricardo Ferreira', 'Roberto Gomes', 'Eduardo Barbosa',
      'Felipe Nascimento', 'Gustavo Ribeiro', 'Henrique Campos', 'Igor Moreira', 'Leonardo Cardoso'
    ],
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1541647376583-8934aaf3448a?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face'
    ]
  },
  stores: {
    names: [
      'Fashion Store', 'Tech Shop', 'Book Corner', 'Coffee House', 'Pet Store',
      'Beauty Salon', 'Sport Center', 'Music Store', 'Art Gallery', 'Flower Shop',
      'Bike Shop', 'Game Store', 'Jewelry Box', 'Home Decor', 'Toy Land',
      'Garden Center', 'Photo Studio', 'Wine Bar', 'Bakery', 'Travel Agency'
    ],
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=150&h=150&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=150&h=150&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1493663284031-b7e3aaa4b7bb?w=150&h=150&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=150&h=150&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=150&h=150&fit=crop&crop=center'
    ]
  }
};

export const useDisguiseMode = () => {
  const { data: settings } = useChatSettings();

  const isDisguiseModeEnabled = settings?.disguise_mode_enabled || false;
  const disguiseModeType = settings?.disguise_mode_type || 'women';

  const getDisguisedContact = (originalId: string, originalName: string, originalPhoto: string) => {
    if (!isDisguiseModeEnabled) {
      return { name: originalName, photo: originalPhoto };
    }

    // Create a hash from the original ID to ensure consistent disguise
    let hash = 0;
    for (let i = 0; i < originalId.length; i++) {
      const char = originalId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const data = DISGUISE_DATA[disguiseModeType as keyof typeof DISGUISE_DATA];
    const nameIndex = Math.abs(hash) % data.names.length;
    const photoIndex = Math.abs(hash >> 1) % data.photos.length;

    return {
      name: data.names[nameIndex],
      photo: data.photos[photoIndex]
    };
  };

  return {
    isDisguiseModeEnabled,
    disguiseModeType,
    getDisguisedContact
  };
};
