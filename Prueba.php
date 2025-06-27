<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galería de Imágenes - Solución</title>
    <style>
        /* Reset básico */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c);
            color: #fff;
            line-height: 1.6;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        }
        
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5rem;
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .solution-explanation {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .solution-explanation h2 {
            margin-bottom: 15px;
            color: #ffd700;
        }
        
        .solution-explanation ul {
            margin-left: 20px;
            margin-bottom: 15px;
        }
        
        .solution-explanation li {
            margin-bottom: 8px;
        }
        
        .solution-explanation code {
            background: rgba(0, 0, 0, 0.4);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }
        
        .gallery-section {
            margin-bottom: 2rem;
        }
        
        .gallery-section .section-title {
            text-align: center;
            margin-bottom: 1.5rem;
            font-size: 1.8rem;
            color: #ffd700;
        }
        
        /* SOLUCIÓN: Cambiar a Flexbox en lugar de columns */
        .masonry-gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
        }
        
        .masonry-item {
            flex: 1 1 calc(33.333% - 1.5rem);
            min-width: 250px;
            border-radius: 1rem;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .masonry-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.4);
        }
        
        .masonry-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            display: block;
            transition: transform 0.3s ease;
        }
        
        .masonry-item:hover img {
            transform: scale(1.05);
        }
        
        .image-title {
            padding: 12px;
            text-align: center;
            font-weight: 500;
        }
        
        /* Responsive */
        @media (max-width: 900px) {
            .masonry-item {
                flex: 1 1 calc(50% - 1.5rem);
            }
        }
        
        @media (max-width: 576px) {
            .masonry-item {
                flex: 1 1 100%;
            }
            
            h1 {
                font-size: 2rem;
            }
        }
        
        .success-message {
            text-align: center;
            margin-top: 30px;
            padding: 15px;
            background: rgba(40, 167, 69, 0.2);
            border: 1px solid rgba(40, 167, 69, 0.5);
            border-radius: 10px;
            font-size: 1.1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Solución al Problema de la Galería</h1>
        
        <div class="solution-explanation">
            <h2>¿Qué estaba pasando?</h2>
            <p>El diseño original usaba la propiedad <code>columns</code> para crear un efecto de mampostería (masonry), pero esto causaba que las imágenes se apilaran verticalmente en lugar de mostrarse en columnas paralelas.</p>
            
            <h2>Solución Implementada:</h2>
            <ul>
                <li>Reemplazamos <code>columns: 250px;</code> con un diseño Flexbox</li>
                <li>Ajustamos los elementos para que se muestren en 3 columnas (33.33% de ancho)</li>
                <li>Agregamos <code>gap</code> para mantener el espacio entre elementos</li>
                <li>Implementamos un diseño responsivo que se adapta a diferentes tamaños de pantalla</li>
            </ul>
            
            <p>Código clave:</p>
            <pre><code>.masonry-gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.masonry-item {
    flex: 1 1 calc(33.333% - 1.5rem);
    min-width: 250px;
}</code></pre>
        </div>
        
        <section class="gallery-section">
            <h2 class="section-title">Galería de Imágenes (Solución)</h2>
            <div class="masonry-gallery">
                <div class="masonry-item">
                    <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Automóvil deportivo">
                    <div class="image-title">Deportivo Clásico</div>
                </div>
                <div class="masonry-item">
                    <img src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Automóvil deportivo">
                    <div class="image-title">Muscle Car</div>
                </div>
                <div class="masonry-item">
                    <img src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Automóvil familiar">
                    <div class="image-title">Familiar Elegante</div>
                </div>
                <div class="masonry-item">
                    <img src="https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Automóvil todoterreno">
                    <div class="image-title">4x4 Aventurero</div>
                </div>
                <div class="masonry-item">
                    <img src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Automóvil eléctrico">
                    <div class="image-title">Eléctrico Futurista</div>
                </div>
                <div class="masonry-item">
                    <img src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Automóvil clásico">
                    <div class="image-title">Clásico Restaurado</div>
                </div>
            </div>
        </section>
        
        <div class="success-message">
            ¡Problema resuelto! Ahora las imágenes se muestran correctamente en columnas paralelas.
        </div>
    </div>
</body>
</html>