import { useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';

const AutoShrinkTypography = ({ children, minFontSize = 10, initialFontSize = 16, ...rest }) => {
  const ref = useRef(null);
  const [fontSize, setFontSize] = useState(initialFontSize);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Função para reajustar o tamanho da fonte
    const adjustFontSize = () => {
      let newFontSize = initialFontSize;
      element.style.fontSize = newFontSize + 'px';

      // Encolhe a fonte enquanto o conteúdo ultrapassar a largura do container e não estiver abaixo do mínimo
      while (element.scrollWidth > element.clientWidth && newFontSize > minFontSize) {
        newFontSize -= 1;
        element.style.fontSize = newFontSize + 'px';
      }

      setFontSize(newFontSize);
    };

    // Executa ajuste inicialmente
    adjustFontSize();

    // Opcional: monitorar redimensionamento da janela para recalcular
    window.addEventListener('resize', adjustFontSize);
    return () => {
      window.removeEventListener('resize', adjustFontSize);
    };
  }, [children, initialFontSize, minFontSize]);

  return (
    <Typography ref={ref} {...rest} style={{ fontSize: fontSize }}>
      {children}
    </Typography>
  );
};

export default AutoShrinkTypography;
