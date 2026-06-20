interface MetricProps {
  label: string;
  metricValue: number;
}

export function Metric({ label, metricValue }: MetricProps) {
  return (
    <div>
      <div className='text-lg font-semibold'>{metricValue}</div>
      <div className='text-muted-foreground'>{label}</div>
    </div>
  );
}
