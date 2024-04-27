import { supabase } from '@/utils/supabase'
import type { User } from '@/types/queries'

export async function getUserWithTag(tag: string) {
  const { data, error } = await supabase
    .from('users')
    .select(
      '*,\
      following:follows!follower(followee),\
      follower:follows!followee(follower),\
      posts(*, comments(*), likes(*), retweets(*))'
    )
    .order('created_at', { ascending: false, referencedTable: 'posts' })
    .eq('tag', tag)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, user:users(*), comments(*), likes(*), retweets(*)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data.map((post) => {
    const { user, ...rest } = post
    return {
      author: user!,
      post: rest
    }
  })
}

export async function getPostById(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(
      '*,\
      user:users(*,following:follows!follower(followee),\
      follower:follows!followee(follower)),\
      comments(*,user:users(*)),\
      likes(*,user:users(*)),\
      retweets(*)'
    )
    .order('created_at', { ascending: false, referencedTable: 'comments' })
    .eq('id', postId)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateUserMetaByTag(tag: string, data: Partial<User>) {
  const { error } = await supabase.from('users').update(data).eq('tag', tag).single()
  if (error) throw new Error(error.message)
}

export async function getPostsByTextSearch(keyword: string) {
  if (!keyword) throw new Error('No keyword provided')

  const { data, error } = await supabase
    .from('posts')
    .select('*, user:users(*), comments(*), likes(*), retweets(*)')
    .textSearch('content', keyword, {
      type: 'websearch'
    })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getUserFollowRelationByTag(tag: string) {
  const { data, error } = await supabase
    .from('users')
    .select(
      '*, \
      following:follows!follower(*, user:users!public_follows_followee_fkey(*, follows!public_follows_followee_fkey(*))), \
      follower:follows!followee(*, user:users!public_follows_follower_fkey(*, follows!public_follows_followee_fkey(*)))'
    )
    .eq('tag', tag)
    .single()
  if (error) throw new Error(error.message)
  return data
}
