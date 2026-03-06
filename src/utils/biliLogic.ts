export interface BiliInput {
  ageHours: number;
  tsb: number; // Total Serum Bilirubin in mg/dL
  gestationalAge: number; // Weeks
  riskFactors: boolean;
  guidelineVersion: '2004' | '2022';
}

export interface BiliResult {
  riskZone: 'Low' | 'Low-Intermediate' | 'High-Intermediate' | 'High';
  phototherapyThreshold: number | null;
  exchangeThreshold: number | null;
  recommendation: string;
  neonatalRiskLevel: 'Low' | 'Medium' | 'High';
}

// Bhutani Nomogram Percentiles (Risk Zones)
// Refined values based on standard Hour-Specific Nomogram
const bhutaniData = [
  { age: 0, p40: 3.8, p75: 5.0, p95: 7.0 }, // Extrapolated start
  { age: 12, p40: 4.0, p75: 5.5, p95: 7.5 },
  { age: 24, p40: 5.0, p75: 6.5, p95: 8.5 },
  { age: 36, p40: 6.5, p75: 9.0, p95: 11.5 },
  { age: 48, p40: 8.0, p75: 11.0, p95: 13.5 },
  { age: 60, p40: 9.5, p75: 12.5, p95: 15.0 },
  { age: 72, p40: 10.5, p75: 14.0, p95: 16.5 },
  { age: 84, p40: 11.5, p75: 15.0, p95: 17.5 },
  { age: 96, p40: 12.5, p75: 16.0, p95: 17.5 }, // 95th %ile flattens earlier
  { age: 108, p40: 13.0, p75: 16.5, p95: 18.0 },
  { age: 120, p40: 13.5, p75: 17.0, p95: 18.0 },
  { age: 132, p40: 13.5, p75: 17.0, p95: 18.0 },
  { age: 144, p40: 13.5, p75: 17.0, p95: 18.0 },
];

// AAP 2004 Phototherapy Thresholds
// Refined based on provided 2004 Nomogram image
const phototherapyData2004 = [
  { age: 24, low: 12.0, medium: 10.0, high: 8.0 },
  { age: 36, low: 13.5, medium: 11.5, high: 9.5 },
  { age: 48, low: 15.0, medium: 13.0, high: 11.0 },
  { age: 60, low: 16.5, medium: 14.0, high: 12.5 },
  { age: 72, low: 18.0, medium: 15.0, high: 13.5 },
  { age: 84, low: 19.0, medium: 16.0, high: 14.0 },
  { age: 96, low: 20.0, medium: 17.0, high: 15.0 },
  { age: 108, low: 21.0, medium: 18.0, high: 15.0 },
  { age: 120, low: 21.0, medium: 18.2, high: 15.0 },
];

// AAP 2004 Exchange Transfusion Thresholds
// Refined based on provided 2004 Nomogram image
const exchangeData2004 = [
  { age: 24, low: 19.0, medium: 16.5, high: 15.0 },
  { age: 36, low: 20.5, medium: 18.0, high: 16.0 },
  { age: 48, low: 22.0, medium: 19.0, high: 17.0 },
  { age: 60, low: 23.0, medium: 20.0, high: 18.0 },
  { age: 72, low: 24.0, medium: 21.0, high: 18.5 },
  { age: 84, low: 24.5, medium: 22.0, high: 19.0 },
  { age: 96, low: 25.0, medium: 22.5, high: 19.0 },
  { age: 108, low: 25.0, medium: 22.5, high: 19.0 },
  { age: 120, low: 25.0, medium: 22.5, high: 19.0 },
];

// AAP 2022 Guidelines (Approximation/Placeholder)
// 2022 guidelines generally allow slightly higher TSB levels.
// These are offset approximations (+1-2 mg/dL) to demonstrate the switch functionality.
const phototherapyData2022 = [
  { age: 24, low: 13.0, medium: 11.0, high: 9.0 },
  { age: 36, low: 14.5, medium: 12.5, high: 10.5 },
  { age: 48, low: 16.0, medium: 14.0, high: 12.0 },
  { age: 60, low: 17.5, medium: 15.5, high: 13.5 },
  { age: 72, low: 19.0, medium: 16.5, high: 14.5 },
  { age: 84, low: 20.5, medium: 17.5, high: 15.5 },
  { age: 96, low: 21.5, medium: 18.5, high: 16.0 },
  { age: 108, low: 22.5, medium: 19.5, high: 16.5 },
  { age: 120, low: 23.0, medium: 20.0, high: 17.0 },
];

const exchangeData2022 = [
  { age: 24, low: 20.0, medium: 17.5, high: 16.0 },
  { age: 36, low: 21.5, medium: 19.0, high: 17.0 },
  { age: 48, low: 23.0, medium: 20.5, high: 18.0 },
  { age: 60, low: 24.0, medium: 21.5, high: 19.0 },
  { age: 72, low: 25.0, medium: 22.5, high: 19.5 },
  { age: 84, low: 25.5, medium: 23.0, high: 20.0 },
  { age: 96, low: 26.0, medium: 23.5, high: 20.0 },
  { age: 108, low: 26.0, medium: 23.5, high: 20.0 },
  { age: 120, low: 26.0, medium: 23.5, high: 20.0 },
];

function interpolate(age: number, data: any[], key: string): number {
  // Find the two points surrounding the age
  if (age < data[0].age) return data[0][key];
  if (age >= data[data.length - 1].age) return data[data.length - 1][key];

  const i = data.findIndex((d) => d.age > age);
  const p1 = data[i - 1];
  const p2 = data[i];

  const ratio = (age - p1.age) / (p2.age - p1.age);
  return p1[key] + ratio * (p2[key] - p1[key]);
}

export function calculateBiliRisk(input: BiliInput): BiliResult {
  const { ageHours, tsb, gestationalAge, riskFactors, guidelineVersion } = input;

  // 1. Determine Risk Zone (Bhutani)
  // Note: 2022 guidelines de-emphasize Bhutani for risk stratification, 
  // but we retain it for visualization as requested.
  const p40 = interpolate(ageHours, bhutaniData, 'p40');
  const p75 = interpolate(ageHours, bhutaniData, 'p75');
  const p95 = interpolate(ageHours, bhutaniData, 'p95');

  let riskZone: BiliResult['riskZone'] = 'Low';
  if (tsb >= p95) riskZone = 'High';
  else if (tsb >= p75) riskZone = 'High-Intermediate';
  else if (tsb >= p40) riskZone = 'Low-Intermediate';

  // 2. Determine Phototherapy Threshold
  // Risk Level for Phototherapy:
  // Low Risk: >= 38 weeks and well
  // Medium Risk: >= 38 weeks + risk factors OR 35-37 6/7 weeks and well
  // High Risk: 35-37 6/7 weeks + risk factors
  
  let ptCurve = 'low'; // Default to Low Risk curve (highest threshold)
  let neonatalRiskLevel: BiliResult['neonatalRiskLevel'] = 'Low';

  if (gestationalAge < 35) {
     // Not covered by standard AAP nomogram (needs NICU specific charts)
     ptCurve = 'high'; 
     neonatalRiskLevel = 'High';
  } else if (gestationalAge >= 38) {
    if (riskFactors) {
      ptCurve = 'medium';
      neonatalRiskLevel = 'Medium';
    } else {
      ptCurve = 'low';
      neonatalRiskLevel = 'Low';
    }
  } else if (gestationalAge >= 35) {
    if (riskFactors) {
      ptCurve = 'high';
      neonatalRiskLevel = 'High';
    } else {
      ptCurve = 'medium';
      neonatalRiskLevel = 'Medium';
    }
  }

  // Select dataset based on guideline version
  const ptData = guidelineVersion === '2022' ? phototherapyData2022 : phototherapyData2004;
  const exData = guidelineVersion === '2022' ? exchangeData2022 : exchangeData2004;

  const ptThreshold = interpolate(ageHours, ptData, ptCurve);
  const exchangeThreshold = interpolate(ageHours, exData, ptCurve);

  // 3. Recommendation
  let recommendation = '';
  if (tsb >= exchangeThreshold) {
    recommendation = 'Exchange Transfusion recommended. Start intensive phototherapy immediately.';
  } else if (tsb >= ptThreshold) {
    recommendation = 'Start Phototherapy immediately. Repeat TSB in 4-6 hours.';
  } else if (tsb >= ptThreshold - 2) {
    recommendation = 'Consider Phototherapy. Repeat TSB in 6-12 hours.';
  } else {
    recommendation = 'Routine care. Follow-up based on risk zone.';
  }

  return {
    riskZone,
    phototherapyThreshold: parseFloat(ptThreshold.toFixed(1)),
    exchangeThreshold: parseFloat(exchangeThreshold.toFixed(1)),
    recommendation,
    neonatalRiskLevel,
  };
}

export { bhutaniData, phototherapyData2004, exchangeData2004 };

