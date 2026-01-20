// qrcode.react.d.ts
declare module 'qrcode.react' {
  import * as React from 'react';

  export interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    includeMargin?: boolean;
    renderAs?: 'canvas' | 'svg';
  }

  const QRCode: React.FC<QRCodeProps>;
  export default QRCode;
}
