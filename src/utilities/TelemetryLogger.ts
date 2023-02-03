import TelemetryReporter, { TelemetryEventMeasurements, TelemetryEventProperties } from '@vscode/extension-telemetry';
import { extensions } from 'vscode';

export class TelemetryLogger {

    private static _instance: TelemetryLogger = new TelemetryLogger();
    private telemetryReporter: TelemetryReporter;
    private instrumentationKey = Buffer.from('NTMwMTliNjctNGIyZS00NDg5LWFlNmYtZmE3MjIxYjRhNTg1', 'base64').toString();
    private extensionId = 'spydra.hyperledger-fabric-debugger';

    public static instance(): TelemetryLogger {
        return TelemetryLogger._instance;
    }

    private constructor() {
        const extension = extensions.getExtension(this.extensionId)!;
        const extensionVersion = extension.packageJSON.version;
        this.telemetryReporter = new TelemetryReporter(this.extensionId, extensionVersion, this.instrumentationKey);
    }

    public async sendTelemetryEvent(eventName: string, properties?: TelemetryEventProperties, measurements?: TelemetryEventMeasurements) {
        this.telemetryReporter.sendRawTelemetryEvent(eventName, properties, measurements);
    }

    public async sendTelemetryErrorEvent(eventName: string, properties?: TelemetryEventProperties, measurements?: TelemetryEventMeasurements) {
        this.telemetryReporter.sendTelemetryErrorEvent(eventName, properties, measurements);
    }

    public async sendTelemetryException(error: Error, properties?: TelemetryEventProperties, measurements?: TelemetryEventMeasurements) {
        this.telemetryReporter.sendTelemetryException(error, properties, measurements);
    }

    public parseHrtimeToMs(hrtime: [number, number]) {
        var ms = Math.round((hrtime[0] * 1000000000 + hrtime[1]) / 1000000);
        return ms;
    }

    public dispose() {
        this.telemetryReporter.dispose();
    }
}