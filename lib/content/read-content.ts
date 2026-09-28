import { readFile } from 'node:fs/promises'
import path from 'node:path'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export async function readCalculatorContent(slug: string): Promise<string> {
  return readFile(path.join(CONTENT_DIR, 'calculators', `${slug}.mdx`), 'utf8')
}

export async function readGuideContent(slug: string): Promise<string> {
  return readFile(path.join(CONTENT_DIR, 'guides', `${slug}.mdx`), 'utf8')
}
