/* eslint-disable no-console */
import Entity from './domain/Entity'
import TagInfo from './domain/TagInfo'

// joining path of directory
const tagRe = /\[\[ent.([a-zA-Z_.-]*)\]\]/gm

function extractEntities(markdown: string, noteId: string, date: Date): Entity[] {
  const elements: Array<TagInfo | string> = []
  const tagInfos = findEntitiesTags(markdown)


  const entities: Entity[] = []

  for (const tagInfo of tagInfos) {
    const entity = new Entity(noteId, date);
    entity.type = tagInfo.tag;
    entities.push(entity);
  }

  console.log(entities)
  return entities
}

function findEntitiesTags(markdown: string): TagInfo[] {
  const matches = markdown.matchAll(tagRe)
  const infos: TagInfo[] = []
  if (matches !== null) {
    for (const match of matches) {
      const info = new TagInfo(match.index || -1, match[0].length, match[1])
      infos.push(info)
    }
  }
  return infos
}

export { findEntitiesTags, extractEntities }
