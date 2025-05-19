'use client'
import React from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import messages from '@/messages.json';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';


const Home = () => {
  return (
    <>
      
    <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 ">
      <section className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold">
        Exploring the Realm of Anonymous Feedback
        </h1>
        <p className="mt-3 md:mt-4 text-base md:text-lg">
        Feed Tube: The Place Where Your Identity Stays Hidden
        </p>
        </section>
        
      <Carousel
        plugins={[Autoplay({ delay: 2000 })]}
        className="w-full max-w-lg md:max-w-xl"
      >
        <CarouselContent>
          {messages.map((message, index) => (
            <CarouselItem key={index} className="p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Anonymous</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                  <Mail className="flex-shrink-0" />
                  <div>
                    <p>{message.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {message.received}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </main>

      <footer className="text-center p-4 md:p-6 flex flex-col">
        <div>
          <Link href={'https://github.com/Navoren'}><Button variant="ghost" className='m-3'><Github /></Button></Link>
        <Link href={'https://twitter.com/nmntmr'}><Button variant="ghost" className='m-3'><Twitter /></Button></Link>
          <Link href={'https://www.linkedin.com/in/navoren/'}><Button variant="ghost" className='m-3'><Linkedin /></Button></Link>
        </div>
        Made with ❤️ by @navoren
    </footer>
  </>
  )
}

export default Home