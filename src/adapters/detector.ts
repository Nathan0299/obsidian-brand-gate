export interface DetectionResult {
    tsi: number;
    sdi: number;
    aai: number;
    violations: string[];
}

export interface DetectorAdapter {
    name: string;
    evaluate(content: string, coaIr: any): Promise<DetectionResult>;
}
