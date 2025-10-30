
import React, { useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { UploadIcon, ClipboardIcon } from './Icons';

interface UploadManagerProps {
    onUpload: (data: any[][]) => void;
}

const UploadManager: React.FC<UploadManagerProps> = ({ onUpload }) => {
    const [isPasting, setIsPasting] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processData = useCallback((data: any[][]) => {
        if (data && data.length > 0) {
            onUpload(data);
        } else {
            alert("El archivo o los datos pegados están vacíos o en un formato incorrecto.");
        }
    }, [onUpload]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                processData(json);
            };
            reader.readAsBinaryString(file);
        }
    };

    const handlePaste = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const pastedData = event.target.value;
        const rows = pastedData.split('\n').map(row => row.split('\t'));
        processData(rows);
        setIsPasting(false);
    };
    
    const triggerFileIput = () => {
      fileInputRef.current?.click();
    }

    return (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    onClick={triggerFileIput}
                >
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold text-primary-600">Subir un archivo</span> o arrastrar y soltar
                    </p>
                    <p className="text-xs text-gray-500">XLSX, XLS, CSV</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".xlsx, .xls, .csv"
                    />
                    {fileName && <p className="text-xs text-gray-500 mt-2">Archivo seleccionado: {fileName}</p>}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ClipboardIcon className="mx-auto h-12 w-12 text-gray-400" />
                    {isPasting ? (
                        <textarea
                            className="w-full h-24 mt-2 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Pegue aquí los datos de su hoja de cálculo..."
                            onBlur={() => setIsPasting(false)}
                            onChange={handlePaste}
                            autoFocus
                        />
                    ) : (
                        <div>
                            <p className="mt-2 text-sm text-gray-600">
                                <button onClick={() => setIsPasting(true)} className="font-semibold text-primary-600">
                                    Pegar datos
                                </button>
                                 &nbsp;desde el portapapeles
                            </p>
                            <p className="text-xs text-gray-500">Copie un rango de celdas y péguelo aquí</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadManager;
