import fs from 'fs'
import path from 'path'
import { extractEntities, findEntitiesTags } from './extractEntities'

const directoryPath = path.join(__dirname, '../../../../candide/Dendron/vault')


describe('Entities extraction', () => {
  it('detects tags', () => {
    const expl = 'Bonjour, [[#tags.sometag]][[ent.dreams.persons.aliocha]] tag here'
    const infos = findEntitiesTags(expl)
    expect(infos.length).toBe(1)
  })
  it('detects 1 entity', () => {
    const expl = 'J\'ai rêvé d\'[[ent.dreams.persons.aliocha]] cette nuit'
    const entities = extractEntities(expl, 'testNoteId', new Date())
    expect(entities.length).toBe(1)
    expect(entities[0].type).toBe('dreams.persons.aliocha')
  })
})
