import { IRecurrenceStrategy } from './IRecurrenceStrategy'
import type { RecurrenceRuleData } from '../../models/RecurrenceRuleModel'
import { RRule } from 'rrule'
import type { Options as RRuleOptions } from 'rrule'

export class MonthlyStrategy implements IRecurrenceStrategy {
	createRRuleOptions(
		rule: RecurrenceRuleData,
		startTime: string
	): Partial<RRuleOptions> {
		return {
			freq: RRule.MONTHLY,
			dtstart: new Date(startTime),
			interval: rule.interval ?? 1,
			wkst: RRule.MO,
			until: rule.until ? new Date(rule.until) : null,
			count: rule.count ?? null,
		}
	}
}
