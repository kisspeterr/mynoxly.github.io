{/* Interactive Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
              <TabsTrigger 
                value="events" 
                className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-cyan-500/20 transition-all"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Események
              </TabsTrigger>
              <TabsTrigger 
                value="deals" 
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-purple-500/20 transition-all"
              >
                <Ticket className="h-4 w-4 mr-2" />
                Akciók
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="data-[state=active]:bg-pink-500 data-[state=active]:text-white data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-pink-500/20 transition-all"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Térkép
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="mt-6">
              <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-cyan-100">Közelgő Események</CardTitle>
                  <CardDescription className="text-gray-300">Fedezd fel a legfrissebb programokat Pécsen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div>
                          <div className="font-semibold text-gray-100">Pécsi Koncert Est {item}</div>
                          <div className="text-sm text-gray-400">2024.03.{15 + item}. 20:00</div>
                        </div>
                        <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                          Részletek
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deals" className="mt-6">
              <Card className="bg-slate-800/30 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-100">Friss Akciók</CardTitle>
                  <CardDescription className="text-gray-300">Spórolj a kedvenc helyeiden</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2].map((item) => (
                      <Card key={item} className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
                        <CardHeader>
                          <Badge className="w-fit bg-green-500 text-white">-30%</Badge>
                          <CardTitle className="text-gray-100">1+1 Italakció</CardTitle>
                          <CardDescription className="text-gray-300">Kedvenc bárodban</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Progress value={70} className="mb-2 bg-slate-700" />
                          <div className="text-sm text-gray-300">70% felhasználva</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="map" className="mt-6">
              <Card className="bg-slate-800/30 backdrop-blur-sm border-pink-500/20">
                <CardHeader>
                  <CardTitle className="text-pink-100">Élő Térkép</CardTitle>
                  <CardDescription className="text-gray-300">Fedezd fel Pécs legjobb helyeit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gradient-to-br from-cyan-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                      <p className="text-gray-200">Interaktív térkép betöltése...</p>
                      <Button className="mt-4 bg-pink-500 hover:bg-pink-600 text-white">
                        Térkép megnyitása
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>