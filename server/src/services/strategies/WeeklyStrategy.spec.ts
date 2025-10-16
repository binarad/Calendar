import { WeeklyStrategy } from './WeeklyStrategy'
import { RRule } from 'rrule'
import type { RecurrenceRuleData } from '../../models/RecurrenceRuleModel'
import { describe } from 'node:test'

// describe() groups related tests together
describe('WeeklyStrategy', () => {
	// it() or test() defines an individual test case
	it('should generate correct weekly occurrences for an event repeating on Mondays', () => {
		const strategy = new WeeklyStrategy()
		const startTime = '2025-10-27T10:00:00.000Z'

		const ruleData: RecurrenceRuleData = {
			freq: 'WEEKLY',
			interval: 1,
			byday: 'MO',
		}

		const rruleOptions = strategy.createRRuleOptions(ruleData, startTime)
		const rrule = new RRule(rruleOptions)

		const from = new Date('2025-10-27T00:00:00.000Z')
		const to = new Date('2025-11-16T23:59:59.999Z')

		const occurrences = rrule.between(from, to)

		expect(occurrences).toHaveLength(3)
		expect(occurrences[0].toISOString()).toBe('2025-10-27T10:00:00.000Z')
		expect(occurrences[1].toISOString()).toBe('2025-11-03T10:00:00.000Z')
		expect(occurrences[2].toISOString()).toBe('2025-11-10T10:00:00.000Z')
	})

	it('should handle multiple days in a week', () => {
		const strategy = new WeeklyStrategy()
		const startTime = '2025-11-03T12:00:00.000Z'

		const ruleData: RecurrenceRuleData = {
			freq: 'WEEKLY',
			byday: 'MO,WE,FR',
		}

		const rruleOptions = strategy.createRRuleOptions(ruleData, startTime)
		const rule = new RRule(rruleOptions)

		const from = new Date('2025-11-03T00:00:00.000Z')
		const to = new Date('2025-11-09T23:59:59.000Z')
		const occurrences = rule.between(from, to)

		expect(occurrences).toHaveLength(3)
		expect(occurrences.map(day => day.toISOString())).toEqual([
			'2025-11-03T12:00:00.000Z',
			'2025-11-05T12:00:00.000Z',
			'2025-11-07T12:00:00.000Z',
		])
	})
})
