import { LotteryConfig } from '@/lib/lotteries/types';

interface FAQ {
  question: string;
  answer: string;
}

export function getStatisticsFaqs(lottery: LotteryConfig): FAQ[] {
  const hasBonus = lottery.bonusNumber.count > 0;
  return [
    {
      question: `What does "hot" and "cold" mean in ${lottery.name} statistics?`,
      answer: `Hot numbers are those that have been drawn more frequently than expected in recent draws, suggesting a current trend. Cold numbers have appeared less often than expected. Our system uses a weighted scoring model: recent draws count 3x, medium-term 2x, and all-time frequency 1x.`,
    },
    {
      question: `Can statistics predict ${lottery.name} winning numbers?`,
      answer: `No. Each ${lottery.name} drawing is an independent random event, and past results do not influence future outcomes. Statistical analysis identifies historical patterns and trends, but these are for informational and entertainment purposes only. No strategy can guarantee a lottery win.`,
    },
    {
      question: `How are ${lottery.name} pair and triplet frequencies calculated?`,
      answer: `We analyze every historical ${lottery.name} draw to count how often each combination of ${hasBonus ? 'main ' : ''}numbers appears together. Pairs examine two-number combinations, triplets examine three-number groups, and quadruplets examine four-number groups. Results are sorted by frequency.`,
    },
    {
      question: `What does "overdue" mean for a ${lottery.name} number?`,
      answer: `An overdue number is one that hasn't been drawn for longer than its statistically expected interval. For example, if a number appears on average every 10 draws but hasn't appeared in 20 draws, it's considered 100% overdue. This doesn't mean it's "due" to appear — each draw is independent.`,
    },
    {
      question: `How often is ${lottery.name} statistical data updated?`,
      answer: `Our ${lottery.name} statistics are updated daily via an automated system that fetches the latest draw results. All frequency, hot/cold, overdue, and combination analyses reflect the most recent data available.`,
    },
  ];
}

export function getNumbersPageFaqs(lottery: LotteryConfig): FAQ[] {
  const hasBonus = lottery.bonusNumber.count > 0;
  return [
    {
      question: `How are ${lottery.name} number recommendations generated?`,
      answer: `Our recommendations use three statistical strategies — Balanced, Trending, and Contrarian — each weighting frequency analysis, hot/cold detection, overdue patterns, and pair co-occurrence differently. These are based on historical data patterns, not predictions.`,
    },
    {
      question: `What is the Balanced strategy for ${lottery.name}?`,
      answer: `The Balanced strategy gives equal consideration to all statistical factors: number frequency, hot/cold status, overdue analysis, and pair patterns. It aims to produce well-rounded number sets that don't over-emphasize any single metric.`,
    },
    {
      question: `What is the Trending strategy for ${lottery.name}?`,
      answer: `The Trending strategy prioritizes numbers that are currently "hot" — those appearing more frequently in recent draws. It weights recent momentum heavily, selecting numbers that are on an upward trend.`,
    },
    {
      question: `What is the Contrarian strategy for ${lottery.name}?`,
      answer: `The Contrarian strategy focuses on overdue numbers — those that haven't appeared for longer than expected. It selects "cold" numbers under the theory of mean reversion, though each draw remains independent.`,
    },
    {
      question: `Is the ${lottery.name} Quick Pick Generator truly random?`,
      answer: `Yes. Our generator uses crypto.getRandomValues(), the Web Crypto API standard for cryptographically secure random number generation. Numbers are generated entirely in your browser with no server involvement. Each pick of ${lottery.mainNumbers.count} numbers from 1-${lottery.mainNumbers.max}${hasBonus ? ` plus 1 ${lottery.bonusNumber.label} from 1-${lottery.bonusNumber.max}` : ''} is completely independent.`,
    },
  ];
}

export function getTaxCalculatorFaqs(): FAQ[] {
  return [
    {
      question: 'How are lottery winnings taxed in the United States?',
      answer: 'Lottery winnings are taxed at both the federal and state level. The IRS withholds 24% on prizes over $5,000, but the top federal tax bracket is 37%, so you may owe an additional 13% at tax time. State taxes vary from 0% (in states like California, Florida, and Texas) to over 10% in states like New York.',
    },
    {
      question: 'Should I take the lump sum or annuity?',
      answer: 'The lump sum is typically about 50% of the advertised jackpot but gives you immediate access to invest. The annuity pays the full amount over 30 annual payments (increasing ~5% per year) and results in lower total taxes since income is spread across years. The best choice depends on your financial goals and discipline.',
    },
    {
      question: 'Which states have no lottery tax?',
      answer: 'Nine states do not tax lottery winnings: Alaska, California, Florida, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. Of these, California is unique — it has a state income tax but specifically exempts lottery winnings.',
    },
    {
      question: 'Are there local taxes on lottery winnings?',
      answer: 'Yes, some cities add local taxes. New York City adds 3.876% on top of the 10.9% state rate, making it the highest-taxed location for lottery winners. Yonkers, NY adds 1.959%, and Baltimore, MD adds 3.2%.',
    },
    {
      question: 'How accurate is this lottery tax calculator?',
      answer: 'Our calculator uses current 2026 federal tax brackets and up-to-date state tax rates that are verified quarterly. However, these are estimates — your actual tax liability may differ based on your total income, deductions, and filing status. Always consult a qualified tax professional for large winnings.',
    },
  ];
}

export function getOddsCalculatorFaqs(): FAQ[] {
  return [
    {
      question: 'How are lottery odds calculated?',
      answer: 'Lottery odds are calculated using combinatorics. For example, Powerball odds are the number of ways to choose 5 from 69 (C(69,5) = 11,238,513) multiplied by the bonus ball pool (26), giving 1 in 292,201,338. The formula is C(n,r) = n! / (r! × (n-r)!).',
    },
    {
      question: 'Which US lottery has the best odds of winning the jackpot?',
      answer: 'Among the games we cover, Take 5 has the best jackpot odds at 1 in 575,757. Cash4Life has odds of 1 in 21,846,048. NY Lotto is about 1 in 45 million. Powerball (1 in 292 million) and Mega Millions (1 in 290 million) have the longest odds but the largest jackpots.',
    },
    {
      question: 'Does buying more tickets improve my odds?',
      answer: 'Yes, linearly. Two tickets doubles your odds, ten tickets gives 10x the odds. However, even 100 Powerball tickets only gives you a 1 in 2.9 million chance — still extremely unlikely. The expected value of a lottery ticket is almost always negative.',
    },
    {
      question: 'What are the odds of winning any prize?',
      answer: 'Overall odds of winning any prize are much better than jackpot odds. Powerball has about 1 in 24.87 overall odds, meaning roughly 1 in 25 tickets wins something (though most prizes are small, like $4). Mega Millions overall odds are approximately 1 in 24.',
    },
  ];
}

export function getNumberDetailFaqs(lottery: LotteryConfig, number: number, type: 'main' | 'bonus'): FAQ[] {
  const label = type === 'bonus' ? lottery.bonusNumber.label : 'main number';
  return [
    {
      question: `How often does ${label} ${number} appear in ${lottery.name}?`,
      answer: `The frequency of ${label} ${number} varies over time. Check the stats grid above for the exact count and percentage based on all historical ${lottery.name} draws. The frequency rank shows how this number compares to all other ${type === 'bonus' ? 'bonus' : 'main'} numbers.`,
    },
    {
      question: `Is ${label} ${number} a hot or cold number in ${lottery.name}?`,
      answer: `Hot and cold classifications are based on a weighted score combining recent, medium-term, and all-time frequency. The classification shown above reflects the current status. This changes as new draws occur and is updated daily.`,
    },
    {
      question: `When was ${label} ${number} last drawn in ${lottery.name}?`,
      answer: `The "Recent Appearances" section below shows the last 10 draws containing this number, including exact dates and the full set of winning numbers for each draw.`,
    },
    {
      question: `Does the frequency of ${label} ${number} predict future ${lottery.name} results?`,
      answer: `No. Each ${lottery.name} drawing is an independent random event. Historical frequency data is interesting for analysis but has no predictive power over future outcomes. Every number has an equal probability of being drawn regardless of past frequency.`,
    },
  ];
}
