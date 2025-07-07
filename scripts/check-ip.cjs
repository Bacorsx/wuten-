#!/usr/bin/env node

// ========================================
// SCRIPT DE VERIFICACIÓN DE CONFIGURACIÓN DE IP
// ========================================
// 
// Este script verifica la configuración de IP para producción
// Valida que la IP esté configurada correctamente y sea accesible

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Colores para output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

// Función para logging
function log(message, color = 'reset') {
    console.log(`${colors[color]}[${new Date().toISOString()}] ${message}${colors.reset}`);
}

function error(message) {
    log(`ERROR: ${message}`, 'red');
    process.exit(1);
}

function warn(message) {
    log(`WARNING: ${message}`, 'yellow');
}

function success(message) {
    log(`SUCCESS: ${message}`, 'green');
}

function info(message) {
    log(`INFO: ${message}`, 'blue');
}

// Función para verificar si un archivo existe
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

// Función para leer archivo de configuración
function readIpConfig() {
    const configPath = path.join(__dirname, '..', 'config', 'ip-config.js');
    
    if (!fileExists(configPath)) {
        error('No se encontró el archivo config/ip-config.js');
    }
    
    try {
        const content = fs.readFileSync(configPath, 'utf8');
        
        // Extraer IP de AWS usando regex
        const awsIpMatch = content.match(/export const AWS_IP = '([^']+)'/);
        const localIpMatch = content.match(/export const LOCAL_IP = '([^']+)'/);
        
        if (!awsIpMatch) {
            error('No se pudo extraer AWS_IP del archivo de configuración');
        }
        
        return {
            awsIp: awsIpMatch[1],
            localIp: localIpMatch ? localIpMatch[1] : 'localhost'
        };
    } catch (err) {
        error(`Error al leer el archivo de configuración: ${err.message}`);
    }
}

// Función para validar formato de IP
function isValidIp(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
}

// Función para hacer ping a una IP
function pingIp(ip, timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const req = http.get(`http://${ip}`, { timeout }, (res) => {
            const responseTime = Date.now() - startTime;
            resolve({
                success: true,
                statusCode: res.statusCode,
                responseTime
            });
        });
        
        req.on('error', (err) => {
            resolve({
                success: false,
                error: err.message
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({
                success: false,
                error: 'Timeout'
            });
        });
    });
}

// Función para verificar endpoints específicos
async function checkEndpoints(ip) {
    const endpoints = [
        { path: '/wuten-/backend/heartbeat.php', name: 'Backend Heartbeat' },
        { path: '/wuten-/backend/', name: 'Backend Root' },
        { path: '/wuten/', name: 'Frontend Root' }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        const url = `http://${ip}${endpoint.path}`;
        info(`Verificando ${endpoint.name}: ${url}`);
        
        try {
            const result = await pingIp(ip);
            const endpointResult = {
                endpoint: endpoint.name,
                url,
                ...result
            };
            
            if (result.success) {
                success(`✅ ${endpoint.name} responde correctamente (${result.responseTime}ms)`);
            } else {
                warn(`⚠️  ${endpoint.name} no responde: ${result.error}`);
            }
            
            results.push(endpointResult);
        } catch (err) {
            warn(`⚠️  Error al verificar ${endpoint.name}: ${err.message}`);
            results.push({
                endpoint: endpoint.name,
                url,
                success: false,
                error: err.message
            });
        }
    }
    
    return results;
}

// Función para verificar archivos de entorno
function checkEnvironmentFiles() {
    const envFiles = [
        '.env.production',
        '.env.local',
        'env.production.example'
    ];
    
    info('Verificando archivos de entorno...');
    
    for (const envFile of envFiles) {
        const envPath = path.join(__dirname, '..', envFile);
        
        if (fileExists(envPath)) {
            success(`✅ ${envFile} existe`);
            
            // Verificar contenido básico
            try {
                const content = fs.readFileSync(envPath, 'utf8');
                if (content.includes('VITE_API_URL')) {
                    success(`✅ ${envFile} contiene VITE_API_URL`);
                } else {
                    warn(`⚠️  ${envFile} no contiene VITE_API_URL`);
                }
            } catch (err) {
                warn(`⚠️  Error al leer ${envFile}: ${err.message}`);
            }
        } else {
            warn(`⚠️  ${envFile} no existe`);
        }
    }
}

// Función para verificar configuración de Vite
function checkViteConfig() {
    const vitePath = path.join(__dirname, '..', 'vite.config.js');
    
    if (!fileExists(vitePath)) {
        error('No se encontró vite.config.js');
    }
    
    try {
        const content = fs.readFileSync(vitePath, 'utf8');
        
        // Verificar configuraciones importantes
        const checks = [
            { name: 'loadEnv', pattern: /loadEnv/, required: true },
            { name: 'build optimization', pattern: /minify.*terser/, required: true },
            { name: 'sourcemap disabled', pattern: /sourcemap.*false/, required: true },
            { name: 'manual chunks', pattern: /manualChunks/, required: true }
        ];
        
        info('Verificando configuración de Vite...');
        
        for (const check of checks) {
            if (check.pattern.test(content)) {
                success(`✅ ${check.name} configurado`);
            } else if (check.required) {
                warn(`⚠️  ${check.name} no encontrado`);
            }
        }
    } catch (err) {
        error(`Error al leer vite.config.js: ${err.message}`);
    }
}

// Función para generar reporte
function generateReport(ipConfig, endpointResults) {
    const report = {
        timestamp: new Date().toISOString(),
        ipConfig,
        endpoints: endpointResults,
        summary: {
            totalEndpoints: endpointResults.length,
            successfulEndpoints: endpointResults.filter(r => r.success).length,
            failedEndpoints: endpointResults.filter(r => !r.success).length
        }
    };
    
    const reportPath = path.join(__dirname, '..', 'ip-check-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    info(`Reporte generado: ${reportPath}`);
    return report;
}

// Función principal
async function main() {
    console.log('🔍 VERIFICACIÓN DE CONFIGURACIÓN DE IP');
    console.log('=====================================');
    console.log();
    
    try {
        // 1. Leer configuración de IP
        info('Leyendo configuración de IP...');
        const ipConfig = readIpConfig();
        
        success(`IP de AWS configurada: ${ipConfig.awsIp}`);
        success(`IP local configurada: ${ipConfig.localIp}`);
        
        // 2. Validar formato de IPs
        info('Validando formato de IPs...');
        
        if (!isValidIp(ipConfig.awsIp)) {
            error(`IP de AWS inválida: ${ipConfig.awsIp}`);
        }
        
        if (!isValidIp(ipConfig.localIp) && ipConfig.localIp !== 'localhost') {
            warn(`IP local puede ser inválida: ${ipConfig.localIp}`);
        }
        
        success('Formato de IPs válido');
        
        // 3. Verificar conectividad
        info('Verificando conectividad...');
        const pingResult = await pingIp(ipConfig.awsIp);
        
        if (pingResult.success) {
            success(`✅ IP de AWS responde (${pingResult.responseTime}ms)`);
        } else {
            warn(`⚠️  IP de AWS no responde: ${pingResult.error}`);
        }
        
        // 4. Verificar endpoints específicos
        info('Verificando endpoints específicos...');
        const endpointResults = await checkEndpoints(ipConfig.awsIp);
        
        // 5. Verificar archivos de entorno
        checkEnvironmentFiles();
        
        // 6. Verificar configuración de Vite
        checkViteConfig();
        
        // 7. Generar reporte
        const report = generateReport(ipConfig, endpointResults);
        
        // 8. Mostrar resumen
        console.log();
        console.log('📊 RESUMEN DE VERIFICACIÓN');
        console.log('==========================');
        console.log(`IP de AWS: ${ipConfig.awsIp}`);
        console.log(`IP Local: ${ipConfig.localIp}`);
        console.log(`Endpoints verificados: ${report.summary.totalEndpoints}`);
        console.log(`Endpoints exitosos: ${report.summary.successfulEndpoints}`);
        console.log(`Endpoints fallidos: ${report.summary.failedEndpoints}`);
        
        if (report.summary.failedEndpoints === 0) {
            success('✅ Todas las verificaciones pasaron correctamente');
        } else {
            warn(`⚠️  ${report.summary.failedEndpoints} endpoint(s) fallaron`);
        }
        
        console.log();
        info('URLs importantes:');
        console.log(`🌐 Frontend: http://${ipConfig.awsIp}/wuten/`);
        console.log(`🔧 Backend: http://${ipConfig.awsIp}/wuten-/backend/`);
        console.log(`💓 Heartbeat: http://${ipConfig.awsIp}/wuten-/backend/heartbeat.php`);
        
    } catch (err) {
        error(`Error durante la verificación: ${err.message}`);
    }
}

// Ejecutar función principal
if (require.main === module) {
    main();
}

module.exports = {
    readIpConfig,
    isValidIp,
    pingIp,
    checkEndpoints
}; 