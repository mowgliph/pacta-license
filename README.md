# Generador de Licencias PACTA

Este es el generador de licencias para el sistema PACTA. Este proyecto genera licencias únicas y seguras para el sistema de gestión de contratos PACTA.

## Características

- Generación de licencias únicas y seguras
- Validación de licencias
- Soporte para múltiples tipos de licencias
- Generación de reportes de licencias
- Sistema de validación y verificación

## Requisitos

- Node.js 18 o superior
- npm o yarn

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/mowgliph/pacta-license.git
```

2. Instala las dependencias:
```bash
npm install
```

## Uso

El generador de licencias puede ser usado de dos formas:

1. Como CLI:
```bash
node dist/cli.js --help
```

2. Como módulo Node.js:
```javascript
import { LicenseGenerator } from './dist/license-generator.js';

const generator = new LicenseGenerator();
const license = generator.generate();
```

## Estructura del Proyecto

- `src/`: Código fuente
  - `cli.ts`: Interfaz de línea de comandos
  - `license-generator.ts`: Lógica principal de generación
  - `types.ts`: Definiciones de tipos TypeScript
- `example/`: Ejemplos de uso
- `licencias-generadas/`: Licencias generadas
- `dist/`: Código compilado

## Contribución

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT - ve el archivo LICENSE para más detalles.
