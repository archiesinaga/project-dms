'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Factory, 
  Package, 
  Leaf, 
  Globe, 
  Award,
  Users,
  History,
  CheckCircle2,
  MapPin
} from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PT Sumatera Prima Fibreboard (SPF)
          </h1>
          <p className="text-xl text-gray-600">
            Leading MDF Manufacturer in South Sumatra
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-transparent">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Company Overview
            </TabsTrigger>
            <TabsTrigger 
              value="products"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Package className="mr-2 h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger 
              value="sustainability"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Leaf className="mr-2 h-4 w-4" />
              Sustainability
            </TabsTrigger>
            <TabsTrigger 
              value="market"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Globe className="mr-2 h-4 w-4" />
              Market & Reach
            </TabsTrigger>
            <TabsTrigger 
              value="contact"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Visit Us
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-start mb-4">
                    <Factory className="h-6 w-6 mr-3 text-primary mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Location & Capacity</h3>
                      <p className="text-gray-600">
                        Located on a 580,000 m² factory in Inderalaya, 28 km south of Palembang.
                        Annual production capacity of 350,000 m³ of MDF.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start mb-4">
                    <History className="h-6 w-6 mr-3 text-primary mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">History & Workforce</h3>
                      <p className="text-gray-600">
                        Established in 2003, producing MDF boards (2.5–30 mm).
                        Added super-thin line (1.0 mm) in 2011.
                        Currently employs around 500 people.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">MDF Varieties</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Moisture-resistant MDF
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Fire-retardant MDF
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Eco MDF (Low formaldehyde)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      High-density flooring MDF
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Other Products</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Compact Density Fibreboard (CDF)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      PCB-grade MDF
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Melamine-Faced Products
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Veneer-Faced MDF
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sustainability" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-start">
                  <Leaf className="h-6 w-6 mr-3 text-green-500 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Sustainable Practices</h3>
                    <p className="text-gray-600">
                      Uses rubberwood from sustainable forestry and follows green production methods.
                      Active in environmental conservation through tree planting and watershed restoration.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award className="h-6 w-6 mr-3 text-primary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Awards & Recognition</h3>
                    <p className="text-gray-600">
                      Received "Most Outstanding Social Responsibilities" at IndoBuildTech 2024.
                      Holds TKDN certification for local content.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-start mb-4">
                    <Globe className="h-6 w-6 mr-3 text-primary mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Global Presence</h3>
                      <p className="text-gray-600">
                        Exports worldwide and regularly exhibits at major industry events
                        like IndoBuildTech Expo.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start mb-4">
                    <Users className="h-6 w-6 mr-3 text-primary mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Community Engagement</h3>
                      <p className="text-gray-600">
                        Partners with local vocational schools for internships and
                        skill development programs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 mr-3 text-primary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Visit Our Factory</h3>
                    <p className="text-gray-600">
                      Located in Inderalaya, 28 km south of Palembang, South Sumatra.
                      Contact us for factory visits or product inquiries.
                    </p>
                    <div className="mt-4">
                      <a 
                        href="https://spf.co.id" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit our website
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}