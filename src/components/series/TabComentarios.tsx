
import SerieComments from '@/components/series/SerieComments';
import VejaTambemSeries from '@/components/series/VejaTambemSeries';

interface TabComentariosProps {
  serieId: string;
}

const TabComentarios = ({ serieId }: TabComentariosProps) => {
  return (
    <div className="animate-fade-in">
      <SerieComments serieId={serieId} />
      
      <VejaTambemSeries 
        isLoading={false}
        serieAtualId={serieId}
      />
    </div>
  );
};

export default TabComentarios;
