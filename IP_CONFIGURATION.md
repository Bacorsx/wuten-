# 🖥️ Configuración Centralizada de IP - Wuten Inmobiliaria

## 📋 Resumen

Este sistema permite gestionar fácilmente las IPs de la aplicación desde un solo archivo, sin necesidad de modificar múltiples archivos cuando cambie la IP del servidor.

## 🎯 Archivo Principal

### `config/ip-config.js`
Este es el **único archivo** que necesitas modificar cuando cambie la IP de tu servidor AWS.

```javascript
// IP de tu instancia AWS (cambia esta cuando sea necesario)
export const AWS_IP = '54.163.209.36';
```

## 🚀 Métodos para Actualizar la IP

### Método 1: Comando NPM (Recomendado)
```bash
# Actualizar IP usando el comando automático
npm run update-ip 54.163.209.36

# Ejemplos:
npm run update-ip 192.168.1.100
npm run update-ip 10.0.0.50
```

### Método 2: Edición Manual
1. Abre el archivo `config/ip-config.js`
2. Cambia la línea: `export const AWS_IP = '54.163.209.36';`
3. Guarda el archivo
4. La aplicación detectará automáticamente el cambio

### Método 3: Componente Visual
```jsx
import IpConfigManager from './components/IpConfigManager';

// En tu componente
<IpConfigManager show={true} />
```

## 🔧 Cómo Funciona

### Detección Automática de Entorno
El sistema detecta automáticamente si estás en desarrollo o producción:

- **Desarrollo**: Usa `localhost`
- **Producción**: Usa la IP configurada en `AWS_IP`

### URLs Generadas Automáticamente
```javascript
// Desarrollo
API: http://localhost/wuten/backend
Frontend: http://localhost:3000

// Producción
API: http://54.163.209.36/wuten-/backend
Frontend: http://54.163.209.36/wuten
```

## 📁 Archivos Afectados

Cuando cambies la IP en `config/ip-config.js`, estos archivos se actualizarán automáticamente:

- ✅ `src/config/config.js` - Configuración principal
- ✅ `src/api/propiedadesApi.js` - Servicios de API
- ✅ `vite.config.js` - Configuración de Vite
- ✅ Todos los componentes que usen la configuración

## 🧪 Verificación

### Comando de Verificación
```bash
# Verificar configuración actual
npm run check-env
```

### Componente de Verificación
```jsx
import IpConfigManager from './components/IpConfigManager';

// Mostrar información de configuración
<IpConfigManager show={true} />
```

### Prueba de Conexión
El componente `IpConfigManager` incluye un botón "Probar Conexión" que verifica si el backend responde correctamente.

## 🔄 Flujo de Actualización

1. **Cambia la IP** en `config/ip-config.js`
2. **La aplicación detecta** el cambio automáticamente
3. **Reinicia el servidor** si es necesario (`npm run dev`)
4. **Prueba la conexión** usando el componente o comando

## 🚨 Casos de Uso Comunes

### IP Dinámica en AWS
```bash
# Cuando reinicies tu instancia AWS y cambie la IP:
npm run update-ip NUEVA_IP_AWS
```

### Cambio de Entorno
```bash
# Para desarrollo local
npm run dev

# Para producción con nueva IP
npm run update-ip 192.168.1.100
npm run build:aws
```

### Verificación Rápida
```bash
# Verificar configuración actual
npm run check-env

# Probar conexión
curl http://TU_IP/wuten-/backend/heartbeat.php
```

## 📊 Información Disponible

### Configuración Actual
```javascript
import { getConfigInfo } from './config/ip-config';

const info = getConfigInfo();
console.log(info);
// {
//   currentIP: '54.163.209.36',
//   environment: 'production',
//   apiUrl: 'http://54.163.209.36/wuten-/backend',
//   frontendUrl: 'http://54.163.209.36/wuten',
//   lastUpdated: '2024-01-15T10:30:00.000Z'
// }
```

### Información de IP
```javascript
import { ipConfig } from './config/ip-config';

console.log(ipConfig);
// {
//   aws: '54.163.209.36',
//   local: 'localhost',
//   api: 'http://54.163.209.36/wuten-/backend',
//   frontend: 'http://54.163.209.36/wuten',
//   isDevelopment: false,
//   isProduction: true,
//   environment: 'production'
// }
```

## 🔒 Seguridad

- ✅ **No incluye credenciales** de base de datos
- ✅ **Solo configura URLs** y entornos
- ✅ **Puede subirse a Git** sin problemas
- ✅ **Información no sensible**

## 🎉 Beneficios

1. **✅ Un solo archivo** para cambiar toda la configuración
2. **✅ Detección automática** de entorno
3. **✅ Comando automático** para actualizar IP
4. **✅ Componente visual** para gestión
5. **✅ Verificación automática** de conexión
6. **✅ Sin conflictos** con variables de entorno

## 📝 Notas Importantes

- **Siempre verifica** la conexión después de cambiar la IP
- **Usa IP Elástica** en AWS para evitar cambios frecuentes
- **El archivo se puede subir** a Git sin problemas de seguridad
- **La aplicación se actualiza** automáticamente sin reinicio

---

**¡Con este sistema, cambiar la IP es tan fácil como ejecutar un comando! 🚀** 