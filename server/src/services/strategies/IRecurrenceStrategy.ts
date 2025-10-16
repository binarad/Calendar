import type { RecurrenceRuleData } from '../../models/RecurrenceRuleModel'
import type { Options as RRuleOptions } from 'rrule'

export interface IRecurrenceStrategy {
	createRRuleOptions(
		rule: RecurrenceRuleData,
		startTime: string
	): Partial<RRuleOptions>
}
