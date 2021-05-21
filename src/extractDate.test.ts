import extractDate from "./extractDate"

describe('Dates extraction', () => {
    it('detects date', () => {
      const date = extractDate('daily.journal.2021.05.20.md')
      expect(date?.year()).toBe(2021)
      expect(date?.month()).toBe(4)
      expect(date?.date()).toBe(20)
    })
  })
  