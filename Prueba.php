<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infinity Starfield Background</title>
    <style>

    * {
        margin: 0;
        }

        .container {
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  max-height: 750px;
  max-width: 1540px;
  flex-wrap: wrap;
  flex-direction: column;
}

.inv-border {
  width: 768px;
  height: 374px;
  background:rgba(52, 152, 219, 0.31); /* Color de fondo */
  position: relative;
  left: 1px;
  top: 1px;

  mask: 
    radial-gradient(circle at 0 0, transparent 0px, #000 0) top left,
    radial-gradient(circle at 100% 0, transparent 0px, #000 0) top right,
    radial-gradient(circle at 0 100%, transparent 0px, #000 0) bottom left,
    radial-gradient(circle at 100% 100%, transparent 150px, #000 0) bottom right;
  mask-size: 51% 51%;
  mask-repeat: no-repeat;
}
    .inc-border {
  width: 768px;
  height: 374px;
  background: rgba(52, 152, 219, 0.31); /* Color de fondo */
  position: relative;
  left: 1px;
  bottom: 1px;
  
  mask: 
    radial-gradient(circle at 0 0, transparent 0px, #000 0) top left,
    radial-gradient(circle at 100% 0, transparent 150px, #000 0) top right,
    radial-gradient(circle at 0 100%, transparent 0px, #000 0) bottom left,
    radial-gradient(circle at 100% 100%, transparent 0px, #000 0) bottom right;
  mask-size: 51% 51%;
  mask-repeat: no-repeat;
}
    .inf-border {
  width: 768px;
  height: 374px;
  background: rgba(52, 152, 219, 0.31); /* Color de fondo */
  position: relative;
  right: 1px;
  top: 1px;
  
  mask: 
    radial-gradient(circle at 0 0, transparent 0px, #000 0) top left,
    radial-gradient(circle at 100% 0, transparent 0px, #000 0) top right,
    radial-gradient(circle at 0 100%, transparent 150px, #000 0) bottom left,
    radial-gradient(circle at 100% 100%, transparent 0px, #000 0) bottom right;
  mask-size: 51% 51%;
  mask-repeat: no-repeat;
}
    .ing-border {
  width: 768px;
  height: 374px;
  background: rgba(52, 152, 219, 0.31); /* Color de fondo */
  position: relative;
  right: 1px;
  bottom: 1px;
  
  mask: 
    radial-gradient(circle at 0 0, transparent 150px, #000 0) top left,
    radial-gradient(circle at 100% 0, transparent 0px, #000 0) top right,
    radial-gradient(circle at 0 100%, transparent 0px, #000 0) bottom left,
    radial-gradient(circle at 100% 100%, transparent 0px, #000 0) bottom right;
  mask-size: 51% 51%;
  mask-repeat: no-repeat;
}
    </style>
</head>
<body>
    <div class="container">
    <div class="inv-border"></div>
    <div class="inc-border"></div>
    <div class="inf-border"></div>
    <div class="ing-border"></div>
    </div>
</body>
</html>