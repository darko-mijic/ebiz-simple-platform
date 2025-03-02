"use client"

import Link from 'next/link';

export default function UITestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">UI Component Showcase</h1>
      <p className="text-gray-500 mb-8">
        This page will showcase shadcn/ui components once module resolution is fixed. 
        Currently using plain HTML and Tailwind CSS to ensure basic functionality works.
      </p>

      <div className="border p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Buttons (Coming Soon)</h2>
        <div className="flex flex-wrap gap-4">
          <button className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600">
            Primary Button
          </button>
          <button className="py-2 px-4 border border-gray-300 rounded hover:bg-gray-100">
            Secondary Button
          </button>
          <button className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600">
            Destructive Button
          </button>
        </div>
      </div>

      <div className="border p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Cards (Coming Soon)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Card Title</h3>
              <p className="text-gray-500">Card description goes here</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500">This is the card content. It will be replaced with shadcn/ui components.</p>
            </div>
            <div className="p-4 bg-gray-50">
              <button className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600">
                Card Action
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/" className="py-2 px-4 border border-gray-300 rounded hover:bg-gray-100">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 