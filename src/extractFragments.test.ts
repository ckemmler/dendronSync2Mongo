import fs from 'fs'
import path from 'path'
import { load } from 'ts-dotenv';
import { extractFragments, findTags } from './extractFragments'

const env = load({DENDRON_VAULT_PATH: String});
const directoryPath = path.join(__dirname, env.DENDRON_VAULT_PATH);

describe('Fragments extraction', () => {
  it('detects tags', () => {
    const expl = 'Bonjour, [[#tags.tag]][[#tags.otherTag]] tag here'
    const infos = findTags(expl)
    expect(infos.length).toBe(2)
  })
  it('detects 1 fragment', () => {
    const expl = 'Bonjour, [[#tags.tag]] tag here'
    const fragments = extractFragments(expl, 'testNoteId', new Date())
    expect(fragments.length).toBe(1)
    expect(fragments[0].tags.length === 1)
    expect(fragments[0].tags[0]).toBe('tags.tag')
    expect(fragments[0].content).toBe('tag here')
  })
  it('detects fragment with multiple tags', () => {
    for (const expl of [
      `Bonjour, [[#tags.tag]]
      [[#tags.otherTag]] tag here`,
      `Bonjour, [[#tags.tag]][[#tags.otherTag]] tag here`,
      `Bonjour, [[#tags.tag]]  [[#tags.otherTag]] tag here`,
    ]) {
      const fragments = extractFragments(expl, 'testNoteId', new Date())
      expect(fragments.length).toBe(1)
      expect(fragments[0].tags.length === 2)
      expect(fragments[0].tags[0]).toBe('tags.tag')
      expect(fragments[0].tags[1]).toBe('tags.otherTag')
      expect(fragments[0].content).toBe('tag here')
      }
  })
  it('detects fragments in file', () => {
    const file = fs.readFileSync(`${directoryPath}/daily.journal.2021.05.01.md`, {
      encoding: 'utf8',
      flag: 'r',
    })
    const fragments = extractFragments(file, 'testNoteId', new Date())
    expect(fragments.length).toBe(1)
    expect(fragments[0].tags.length === 1)
    expect(fragments[0].tags[0]).toBe('psych-os.mini-projets')
  })
})
