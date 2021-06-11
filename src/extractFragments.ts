/* eslint-disable no-console */
import Fragment from './domain/Fragment'
import TagInfo from './domain/TagInfo'

// joining path of directory
const tagRe = /\[\[#([a-zA-Z_.-]*)\]\]/gm

function extractFragments(markdown: string, noteId: string, date: Date): Fragment[] {

  const elements: Array<TagInfo | string> = []
  const tagInfos = findTags(markdown)

  for (let i = 0; i < tagInfos.length; i += 1) {
    const tag = tagInfos[i]
    elements.push(tag)
    if (i < tagInfos.length - 1) {
      const nextTag = tagInfos[i + 1]
      const followingTextContent = markdown
        .substring(tag.offset, nextTag.tagIndex)
        .trim()
      if (followingTextContent === '') {
        continue
      } else {
        elements.push(followingTextContent)
      }
    } else {
      elements.push(markdown.substring(tag.offset, markdown.length).trim())
    }
  }

  if (elements.length === 0) {
    return []
  }

  const fragments: Fragment[] = [new Fragment(noteId, date)]

  for (const element of elements) {
    if (typeof element === 'string') {
      fragments[fragments.length - 1].content = element
      if (elements.indexOf(element) < elements.length - 1) {
        fragments[fragments.length] = new Fragment(noteId, date)
      }
    } else {
      fragments[fragments.length - 1].tags.push((<TagInfo>element).tag)
    }
  }

  return fragments
}

function findTags(markdown: string): TagInfo[] {
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

export { findTags, extractFragments }
