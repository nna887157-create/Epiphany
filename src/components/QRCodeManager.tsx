import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Copy, Check } from 'lucide-react';

interface QRCodeManagerProps {
  defaultUrl?: string;
}

const QRCodeManager: React.FC<QRCodeManagerProps> = ({ defaultUrl = window.location.origin }) => {
  const [url, setUrl] = useState(defaultUrl);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const downloadQRCodeAsPNG = () => {
    const qrElement = document.getElementById('qr-code');
    if (!qrElement) return;

    html2canvas(qrElement, {
      backgroundColor: '#ffffff',
      scale: 4
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'restaurant-menu-qr-code.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const downloadQRCodeAsPDF = () => {
    const qrElement = document.getElementById('qr-code');
    if (!qrElement) return;

    html2canvas(qrElement, {
      backgroundColor: '#ffffff',
      scale: 4
    }).then(canvas => {
      const pdf = new jsPDF();
      const imgWidth = 150;
      const imgHeight = 150;
      const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      const y = 30;

      pdf.text('Restaurant Menu QR Code', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, imgWidth, imgHeight);
      pdf.text(`URL: ${url}`, 20, y + imgHeight + 20);
      pdf.save('restaurant-menu-qr-code.pdf');
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Gestionnaire de Code QR</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL du Menu
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Entrez l'URL du menu"
          />
          <button
            onClick={handleCopyUrl}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>
      </div>

      <div className="text-center mb-6">
        <div id="qr-code" className="inline-block p-4 bg-white rounded-lg shadow-sm">
          <QRCodeCanvas
            value={url}
            size={200}
            level="M"
            includeMargin={true}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={downloadQRCodeAsPNG}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          PNG
        </button>
        <button
          onClick={downloadQRCodeAsPDF}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          PDF
        </button>
      </div>
    </div>
  );
};

export default QRCodeManager;