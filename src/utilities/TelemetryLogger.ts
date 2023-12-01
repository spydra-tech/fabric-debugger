import TelemetryReporter, { TelemetryEventMeasurements, TelemetryEventProperties } from '@vscode/extension-telemetry';

export class TelemetryLogger {

    private static _instance: TelemetryLogger = new TelemetryLogger();
    private telemetryReporter: TelemetryReporter;
    private instrumentationKey = Buffer.from('NTMwMTliNjctNGIyZS00NDg5LWFlNmYtZmE3MjIxYjRhNTg1', 'base64').toString();

    public static instance(): TelemetryLogger {
        return TelemetryLogger._instance;
    }

    private constructor() {
        this.telemetryReporter = new TelemetryReporter(this.instrumentationKey);
    }

    public async sendTelemetryEvent(eventName: string, properties?: TelemetryEventProperties, measurements?: TelemetryEventMeasurements) {
        this.telemetryReporter.sendRawTelemetryEvent(eventName, properties, measurements);
    }

    public async sendTelemetryErrorEvent(eventName: string, properties?: TelemetryEventProperties, measurements?: TelemetryEventMeasurements) {
        this.telemetryReporter.sendTelemetryErrorEvent(eventName, properties, measurements);
    }

    public parseHrtimeToMs(hrtime: [number, number]) {
        var ms = Math.round((hrtime[0] * 1000000000 + hrtime[1]) / 1000000);
        return ms;
    }

    public dispose() {
        this.telemetryReporter.dispose();
    }
}