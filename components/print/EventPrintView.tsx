import { Event } from '@/core/event/interface/event';

interface EventPrintViewProps {
    event: Event;
}

export const generateEventPrintHTML = ({ event }: EventPrintViewProps): string => {

    // Función para formatear fechas en español
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Función para generar la URL del QR
    const getQRImageUrl = (qrCode: string) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`;
    };

    // Generar HTML para la vista de impresión
    const generatePrintHTML = () => {
        const currentDate = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Evento - ${event.name}</title>
    <style>
        /* Estilos generales */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
        }

        .header p {
            font-size: 16px;
            opacity: 0.9;
        }

        /* Contenido principal */
        .content {
            padding: 30px;
        }

        .event-title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 15px;
        }

        /* Grid de información */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        .info-item {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }

        .info-label {
            font-weight: bold;
            color: #374151;
            font-size: 14px;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
        }

        .info-value {
            color: #1f2937;
            font-size: 16px;
        }

        /* Sección QR */
        .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            border: 2px dashed #d1d5db;
        }

        .qr-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #374151;
        }

        .qr-image {
            max-width: 250px;
            height: auto;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 10px;
        }

        .qr-code-text {
            font-family: 'Courier New', monospace;
            background: #e5e7eb;
            padding: 8px 12px;
            border-radius: 4px;
            display: inline-block;
            font-size: 14px;
            color: #374151;
        }

        /* Descripción */
        .description-section {
            margin: 30px 0;
        }

        .description-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #374151;
        }

        .description-content {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
            font-size: 16px;
            line-height: 1.6;
        }

        /* Footer */
        .footer {
            background: #f3f4f6;
            padding: 20px 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }

        /* Estilos específicos para impresión */
        @media print {
            body {
                padding: 0;
                background: white !important;
            }

            .container {
                border: none;
                border-radius: 0;
                box-shadow: none;
                max-width: none;
                width: 100%;
            }

            .header {
                background: #3b82f6 !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            .info-item {
                background: #f9fafb !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            .qr-section {
                background: #f9fafb !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            .description-content {
                background: #f9fafb !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            .footer {
                background: #f3f4f6 !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            /* Evitar saltos de página en elementos importantes */
            .info-grid,
            .qr-section,
            .description-section {
                page-break-inside: avoid;
            }
        }

        /* Iconos usando Unicode */
        .icon {
            margin-right: 8px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>📋 REPORTE DE EVENTO</h1>
            <p>Información detallada del evento</p>
        </div>

        <!-- Contenido principal -->
        <div class="content">
            <!-- Título del evento -->
            <div class="event-title">
                ${event.name}
            </div>

            <!-- Grid de información -->
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">
                        <span class="icon">📍</span>
                        Ubicación
                    </div>
                    <div class="info-value">${event.address || 'No especificada'}</div>
                </div>

                <div class="info-item">
                    <div class="info-label">
                        <span class="icon">🕐</span>
                        Fecha de Inicio
                    </div>
                    <div class="info-value">${formatDate(event.start_time)}</div>
                </div>

                <div class="info-item">
                    <div class="info-label">
                        <span class="icon">🕐</span>
                        Fecha de Fin
                    </div>
                    <div class="info-value">${formatDate(event.end_time)}</div>
                </div>

                <div class="info-item">
                    <div class="info-label">
                        <span class="icon">👤</span>
                        Organizador
                    </div>
                    <div class="info-value">${event.user?.name || 'No especificado'}</div>
                </div>

                <div class="info-item">
                    <div class="info-label">
                        <span class="icon">📏</span>
                        Radio Permitido
                    </div>
                    <div class="info-value">${event.allowed_radius} metros</div>
                </div>

                <div class="info-item">
                    <div class="info-label">
                        <span class="icon">✅</span>
                        Estado
                    </div>
                    <div class="info-value">${event.active ? 'Activo' : 'Inactivo'}</div>
                </div>
            </div>

            <!-- Sección QR -->
            <div class="qr-section">
                <div class="qr-title">🔲 Código QR del Evento</div>
                <img src="${getQRImageUrl(event.qr_code)}" alt="Código QR" class="qr-image" />
                <br>
                <span class="qr-code-text">${event.qr_code}</span>
            </div>

            <!-- Descripción -->
            ${event.description ? `
            <div class="description-section">
                <div class="description-title">📝 Descripción del Evento</div>
                <div class="description-content">
                    ${event.description}
                </div>
            </div>
            ` : ''}

            <!-- Información adicional -->
            <div class="info-grid">
                ${event.attendances_count !== undefined ? `
                <div class="info-item">
                    <div class="info-label">
                        <span class="icon">📊</span>
                        Asistencias Registradas
                    </div>
                <div class="info-value">${event.attendances_count}</div>
            </div>
                ` : ''}
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">
                        <span class="icon">📅</span>
                        Fecha de Creación
                    </div>
                    <div class="info-value">${formatDate(event.created_at)}</div>
                </div>
            </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>📱 Generado por QuickCheck App el ${currentDate}</p>
            <p>🔗 Sistema de Gestión de Asistencias</p>
        </div>
    </div>

    <script>
        // Función para imprimir automáticamente si se solicita
        function printDocument() {
            window.print();
        }

        // Función para cerrar la ventana después de imprimir
        window.addEventListener('afterprint', function() {
            // En React Native WebView, esto no cerrará la ventana
            // pero puede ser útil para otras implementaciones
        });
    </script>
</body>
</html>
    `;
    };

    return generatePrintHTML();
};
