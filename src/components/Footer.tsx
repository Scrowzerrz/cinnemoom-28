
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-movieDarkBlue border-t border-movieGray/10 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <Link to="/" className="flex items-center">
              <span className="text-white text-2xl font-bold">Cineflix</span>
              <div className="ml-1 w-5 h-5 bg-movieRed rotate-45 relative">
                <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              </div>
            </Link>
            <p className="text-movieGray mt-4 max-w-md">
              Assista filmes e séries online. Seu portal de streaming favorito com as melhores produções cinematográficas.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Navegação</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-movieGray hover:text-white transition-colors inline-block py-1">Início</Link></li>
                <li><Link to="/movies" className="text-movieGray hover:text-white transition-colors inline-block py-1">Filmes</Link></li>
                <li><Link to="/series" className="text-movieGray hover:text-white transition-colors inline-block py-1">Séries</Link></li>
                <li><Link to="/categories" className="text-movieGray hover:text-white transition-colors inline-block py-1">Categorias</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-movieGray hover:text-white transition-colors inline-block py-1">Termos de Uso</Link></li>
                <li><Link to="/privacy" className="text-movieGray hover:text-white transition-colors inline-block py-1">Política de Privacidade</Link></li>
                <li><Link to="/dmca" className="text-movieGray hover:text-white transition-colors inline-block py-1">DMCA</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Ajuda</h3>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-movieGray hover:text-white transition-colors inline-block py-1">FAQ</Link></li>
                <li><Link to="/contact" className="text-movieGray hover:text-white transition-colors inline-block py-1">Contato</Link></li>
                <li><Link to="/about" className="text-movieGray hover:text-white transition-colors inline-block py-1">Sobre</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-movieGray/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-movieGray text-sm mb-4 md:mb-0">
              © 2024 Cineflix. Todos os direitos reservados.
            </p>
            <p className="text-movieGray text-sm text-center md:text-right">
              AVISO LEGAL: Não armazenamos nenhum dos arquivos em nosso servidor. Todos os conteúdos são fornecidos por terceiros sem qualquer tipo de filiação.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
