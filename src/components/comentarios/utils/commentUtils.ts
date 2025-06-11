
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const formatarData = (dataString: string): string => {
  try {
    return formatDistanceToNow(new Date(dataString), { 
      addSuffix: true,
      locale: ptBR 
    });
  } catch (error) {
    return 'data inválida';
  }
};
