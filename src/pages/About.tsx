import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Users, Leaf } from 'lucide-react';

const team = [
  {
    name: 'Tursymbayeva A.S.',
    role: 'Frontend Developer',
    description: 'React/TypeScript UI, gamification, maps, forecast visualization, friends system',
  },
  {
    name: 'Kalykova D.N.',
    role: 'Backend Developer',
    description: 'Go backend, REST API, PostgreSQL, authentication, database design',
  },
  {
    name: 'Valitov R.R.',
    role: 'ML Engineer',
    description: 'Amazon Chronos forecasting model, Python ML service, data pipeline',
  },
  {
    name: 'Nagashybayeva A.D.',
    role: 'ML Engineer',
    description: 'Kazhydromet data processing, air quality indicators, research analysis, ML model training',
  },
];

export default function About() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">

        <div className="bg-gradient-forest rounded-2xl p-8 text-primary-foreground text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">About EcoAlmaty</h1>
          <p className="text-primary-foreground/80 text-sm max-w-xl mx-auto">
            An intelligent web application for air pollution forecasting and eco-footprint tracking in Almaty
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Diploma Project</p>
                <p className="text-sm text-muted-foreground">
                  Development of an AI-Based Web Application for Air Pollution Forecasting and Eco-Footprint Tracking in Almaty
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">University</p>
                <p className="text-sm text-muted-foreground">
                  International Information Technology University (IITU), Almaty
                </p>
                <p className="text-sm text-muted-foreground">
                  Faculty of Information Technologies, Major 6B06110 — Software Engineering
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Research Supervisor</p>
                <p className="text-sm text-muted-foreground">Tleuova G.N.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Our Team</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {team.map((member) => (
              <Card key={member.name} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-forest flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">
                        {member.name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{member.name}</p>
                      <p className="text-xs text-primary font-medium mb-1">{member.role}</p>
                      <p className="text-xs text-muted-foreground">{member.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold">About the Application</h3>
            <p className="text-sm text-muted-foreground">
              EcoAlmaty is a gamified eco-tracking web application developed to help citizens of Almaty monitor air quality, track their ecological footprint, and adopt more sustainable habits through interactive challenges and a community leaderboard.
            </p>
            <p className="text-sm text-muted-foreground">
              The platform uses the Amazon Chronos Foundation Model to forecast concentrations of CO, NO2, SO2, and TSP pollutants based on historical data provided by Kazhydromet. Users can explore forecasts from 5 to 100 years and receive AI-generated summaries of air quality trends.
            </p>
            <p className="text-sm text-muted-foreground">
              The technology stack includes React and TypeScript for the frontend, Go and PostgreSQL for the backend, and a Python-based ML service for air quality forecasting.
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Almaty, 2025 &mdash; IITU Diploma Project
        </p>

      </div>
    </Layout>
  );
}