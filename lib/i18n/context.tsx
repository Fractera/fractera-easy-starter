'use client'

import { createContext, useContext } from 'react'
import { getContent, type HeroContent } from './content'

export const HeroContentCtx = createContext<HeroContent>(getContent('en'))
export const useHeroContent = () => useContext(HeroContentCtx)
