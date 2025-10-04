# Health Guardian - Technical Documentation

**Version:** 2.0  
**Last Updated:** October 4, 2025  
**Author:** Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Architecture](#database-architecture)
6. [AI Integration](#ai-integration)
7. [Authentication & Security](#authentication--security)
8. [API Documentation](#api-documentation)
9. [Component Documentation](#component-documentation)
10. [Data Flow & Real-time Updates](#data-flow--real-time-updates)
11. [Deployment & Infrastructure](#deployment--infrastructure)
12. [Development Guide](#development-guide)

---

## Executive Summary

Health Guardian is a comprehensive web-based health monitoring platform designed to empower caregivers with real-time insights into their family members' health. The application integrates wearable device data, AI-powered health analysis, and intelligent alerting to provide a complete care management solution.

### Key Features
- **Real-time Health Monitoring**: Track vitals including heart rate, blood pressure, and daily steps
- **AI-Powered Insights**: Leverages Google Gemini AI for health analysis and recommendations
- **Intelligent Alerting**: Proactive notifications when health metrics exceed thresholds
- **Conversational Health Assistant**: AI chatbot for answering health-related queries
- **Multi-Member Management**: Monitor multiple family members from a single dashboard
- **Device Integration**: Support for multiple wearable device types

### Technology Stack
- **Frontend**: React 18+ with TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Edge Functions)
- **AI**: Google Gemini 2.5 Flash via Lovable AI Gateway
- **Authentication**: Supabase Auth
- **Real-time**: Simulated real-time updates (production-ready for WebSocket integration)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  AI Chat     │  │  Auth        │      │
│  │  Components  │  │  Assistant   │  │  System      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Supabase)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  REST API    │  │  Edge        │  │  Auth        │      │
│  │  (PostgREST) │  │  Functions   │  │  Service     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │  AI Gateway  │  │  Row Level   │      │
│  │  Database    │  │  (Gemini)    │  │  Security    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### System Components

1. **Client Application**
   - Single-page React application
   - Responsive design with Tailwind CSS
   - Real-time UI updates via state management
   - TypeScript for type safety

2. **API Gateway (Supabase)**
   - RESTful API via PostgREST
   - Edge Functions for custom business logic
   - Built-in authentication service
   - Automatic API generation from database schema

3. **Data Storage**
   - PostgreSQL database
   - Row-Level Security (RLS) policies
   - Automatic timestamps and triggers

4. **AI Services**
   - Edge Functions as AI gateway
   - Integration with Lovable AI Gateway
   - Google Gemini 2.5 Flash model
   - Structured output and streaming support

---

## Frontend Architecture

### Project Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── AddMemberModal.tsx     # Add/edit member dialog
│   ├── AlertActionsModal.tsx  # Emergency action dialog
│   ├── EmptyState.tsx         # Empty state component
│   ├── HealthAssistant.tsx    # AI chatbot component
│   ├── MemberCard.tsx         # Member list card
│   └── MemberDetailPanel.tsx  # Detailed member view
├── pages/
│   ├── Auth.tsx               # Authentication page
│   ├── Dashboard.tsx          # Main dashboard
│   ├── Index.tsx              # Home/redirect page
│   └── NotFound.tsx           # 404 page
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client
│       └── types.ts           # Auto-generated types
├── hooks/
│   ├── use-mobile.tsx         # Mobile detection hook
│   └── use-toast.ts           # Toast notification hook
├── lib/
│   └── utils.ts               # Utility functions
├── index.css                  # Global styles + design system
├── main.tsx                   # Application entry point
└── App.tsx                    # Root component with routing
```

### Design System

The application uses a comprehensive design system defined in `src/index.css`:

```css
:root {
  /* Color Palette - Medical Theme */
  --primary: 203 89% 53%;        /* Medical Blue */
  --primary-foreground: 0 0% 100%;
  --secondary: 158 64% 52%;      /* Healing Green */
  --accent: 38 92% 50%;          /* Warning Orange */
  --destructive: 0 84% 60%;      /* Critical Red */
  --success: 158 64% 52%;        /* Success Green */
  --info: 203 89% 53%;           /* Info Blue */
  
  /* UI Colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --muted: 210 40% 96.1%;
  
  /* Semantic Tokens */
  --border: 214.3 31.8% 91.4%;
  --ring: 203 89% 53%;
}
```

### Key React Components

#### 1. Dashboard (pages/Dashboard.tsx)
**Purpose**: Main application view and state management hub

**Key Responsibilities**:
- Session management and authentication checks
- Member data loading and state management
- Real-time vital simulation (5-second interval)
- Alert status monitoring
- Child component coordination

**State Management**:
```typescript
const [session, setSession] = useState<Session | null>(null);
const [members, setMembers] = useState<Member[]>([]);
const [selectedMember, setSelectedMember] = useState<Member | null>(null);
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [isAssistantOpen, setIsAssistantOpen] = useState(false);
```

**Real-time Simulation Logic**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setMembers((prevMembers) =>
      prevMembers.map((member) => {
        const newHeartRate = Math.max(60, Math.min(100, 
          member.heartRate + (Math.random() - 0.5) * 4));
        const newSteps = member.steps + Math.floor(Math.random() * 15);
        const shouldAlert = Math.random() < 0.05 && newHeartRate > 95;
        
        return {
          ...member,
          heartRate: Math.round(newHeartRate),
          steps: newSteps,
          status: shouldAlert ? "Alert" : "Normal",
        };
      })
    );
  }, 5000);
  
  return () => clearInterval(interval);
}, [members.length]);
```

#### 2. MemberDetailPanel (components/MemberDetailPanel.tsx)
**Purpose**: Display detailed health information for selected member

**Features**:
- Current vital signs display
- AI health insights with refresh capability
- Health history display
- Alert banner for critical status
- Member deletion functionality

**AI Insights Integration**:
```typescript
const fetchInsights = async () => {
  const { data, error } = await supabase.functions.invoke("ai-insights", {
    body: {
      memberData: {
        name: member.name,
        age: member.age,
        relationship: member.relationship,
        healthHistory: member.health_history,
        heartRate: member.heartRate,
        bpSystolic: member.bpSystolic,
        bpDiastolic: member.bpDiastolic,
        steps: member.steps,
      },
    },
  });
  
  if (error) throw error;
  setInsights(data);
};
```

#### 3. AddMemberModal (components/AddMemberModal.tsx)
**Purpose**: Add new family members with device pairing

**Features**:
- Form validation for member details
- Device selection from available devices
- Simulated device pairing flow
- Integrated form submission

**Device Pairing**:
```typescript
const AVAILABLE_DEVICES = [
  { id: "fitband-5", name: "FitBand 5", type: "Smart Band" },
  { id: "healthwatch-pro", name: "HealthWatch Pro", type: "Smartwatch" },
  { id: "vitalmonitor-x", name: "VitalMonitor X", type: "Health Tracker" },
  { id: "pulsetrack-elite", name: "PulseTrack Elite", type: "Fitness Tracker" },
  { id: "carelink-band", name: "CareLink Band", type: "Medical Device" },
];
```

#### 4. HealthAssistant (components/HealthAssistant.tsx)
**Purpose**: AI-powered conversational health assistant

**Features**:
- Contextual awareness of all members
- Streaming responses from AI
- Conversation history management
- Typing indicators

**Streaming Implementation**:
```typescript
const response = await supabase.functions.invoke("ai-chat", {
  body: {
    messages: conversationHistory,
    membersContext: members.map(m => ({
      name: m.name,
      age: m.age,
      relationship: m.relationship,
      healthHistory: m.health_history,
      heartRate: m.heartRate,
      // ... other vitals
    })),
  },
});

// Handle streaming response
const reader = response.data.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  // Append chunk to assistant message
}
```

### Routing Configuration

```typescript
// App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

### State Management Strategy

- **Local Component State**: For UI-specific state (modals, loading states)
- **Props Drilling**: For shared state between parent-child components
- **Supabase Client**: For server state and real-time subscriptions
- **Session Storage**: For authentication state via Supabase Auth

---

## Backend Architecture

### Supabase Configuration

**Project Structure**:
```
supabase/
├── config.toml           # Supabase project configuration
├── migrations/           # Database migration files
│   └── *.sql
└── functions/           # Edge Functions
    ├── ai-insights/
    │   └── index.ts
    └── ai-chat/
        └── index.ts
```

### Edge Functions

Edge Functions are serverless TypeScript/Deno functions that run on Supabase's global edge network.

#### 1. AI Insights Function (ai-insights/index.ts)

**Purpose**: Generate AI-powered health insights for a member

**Endpoint**: `POST /functions/v1/ai-insights`

**Request Body**:
```typescript
{
  memberData: {
    name: string;
    age: number;
    relationship: string;
    healthHistory: string;
    heartRate: number;
    bpSystolic: number;
    bpDiastolic: number;
    steps: number;
  }
}
```

**Response**:
```typescript
{
  summary: string;
  recommendation: string;
}
```

**Implementation Highlights**:
- Uses function calling with structured output
- Integrates with Lovable AI Gateway
- Error handling for rate limits (429) and payment issues (402)
- CORS enabled for web application access

**Prompt Engineering**:
```typescript
const prompt = `You are a professional health advisor analyzing real-time health data.

Member Information:
- Name: ${memberData.name}
- Age: ${memberData.age}
- Relationship: ${memberData.relationship}
- Health History: ${memberData.healthHistory}

Current Vitals:
- Heart Rate: ${memberData.heartRate} BPM
- Blood Pressure: ${memberData.bpSystolic}/${memberData.bpDiastolic} mmHg
- Steps Today: ${memberData.steps}

Analyze this data and provide:
1. A brief summary of their current health status
2. Specific, actionable recommendations for the caregiver`;
```

**AI Model Configuration**:
```typescript
{
  model: "google/gemini-2.5-flash",
  messages: [...],
  tools: [{
    type: "function",
    function: {
      name: "provide_health_insights",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string" },
          recommendation: { type: "string" }
        },
        required: ["summary", "recommendation"]
      }
    }
  }],
  tool_choice: { 
    type: "function", 
    function: { name: "provide_health_insights" } 
  }
}
```

#### 2. AI Chat Function (ai-chat/index.ts)

**Purpose**: Provide streaming conversational AI health assistance

**Endpoint**: `POST /functions/v1/ai-chat`

**Request Body**:
```typescript
{
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  membersContext: Array<{
    name: string;
    age: number;
    relationship: string;
    healthHistory: string;
    heartRate: number;
    bpSystolic: number;
    bpDiastolic: number;
    steps: number;
    status: string;
  }>;
}
```

**Response**: Server-Sent Events (SSE) stream

**System Prompt**:
```typescript
const systemPrompt = `You are a professional health assistant helping caregivers monitor their family members' health.

Current Family Members Being Monitored:
${membersContext.map(m => `
- ${m.name} (${m.age} years old, ${m.relationship})
  Health History: ${m.healthHistory}
  Current Vitals: 
    Heart Rate: ${m.heartRate} BPM
    Blood Pressure: ${m.bpSystolic}/${m.bpDiastolic} mmHg
    Steps: ${m.steps}
    Status: ${m.status}
`).join('\n')}

Provide helpful, professional health advice.`;
```

**Streaming Configuration**:
```typescript
{
  model: "google/gemini-2.5-flash",
  messages: [
    { role: "system", content: systemPrompt },
    ...messages
  ],
  stream: true
}
```

### CORS Configuration

Both Edge Functions implement CORS headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OPTIONS handler
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

### Error Handling

Comprehensive error handling for various scenarios:

```typescript
// Rate limiting
if (response.status === 429) {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Payment required
if (response.status === 402) {
  return new Response(
    JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
    { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Generic errors
catch (error) {
  console.error("Error:", error);
  return new Response(
    JSON.stringify({ error: error.message }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

---

## Database Architecture

### Database Schema

#### 1. profiles Table
**Purpose**: Store additional user information

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Row-Level Security (RLS) Policies**:
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

**Triggers**:
```sql
-- Automatic profile creation on user signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'User'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2. members Table
**Purpose**: Store family member information

```sql
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  relationship TEXT NOT NULL,
  health_history TEXT NOT NULL,
  device_id TEXT,
  status TEXT NOT NULL DEFAULT 'Normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes**:
```sql
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_created_at ON members(created_at DESC);
```

**RLS Policies**:
```sql
-- Users can view their own members
CREATE POLICY "Users can view their own members"
  ON members FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own members
CREATE POLICY "Users can create their own members"
  ON members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own members
CREATE POLICY "Users can update their own members"
  ON members FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own members
CREATE POLICY "Users can delete their own members"
  ON members FOR DELETE
  USING (auth.uid() = user_id);
```

**Triggers**:
```sql
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 3. health_data Table
**Purpose**: Store time-series health metrics

```sql
CREATE TABLE public.health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  heart_rate INTEGER,
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  steps INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes**:
```sql
CREATE INDEX idx_health_data_member_id ON health_data(member_id);
CREATE INDEX idx_health_data_recorded_at ON health_data(recorded_at DESC);
CREATE INDEX idx_health_data_member_time ON health_data(member_id, recorded_at DESC);
```

**RLS Policies**:
```sql
-- Users can view health data for their members
CREATE POLICY "Users can view health data for their members"
  ON health_data FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.id = health_data.member_id
    AND members.user_id = auth.uid()
  ));

-- Users can insert health data for their members
CREATE POLICY "Users can insert health data for their members"
  ON health_data FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM members
    WHERE members.id = health_data.member_id
    AND members.user_id = auth.uid()
  ));
```

### Database Functions

```sql
-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = 'public';
```

### Data Relationships

```
auth.users (Supabase Auth)
    │
    ├─→ profiles (1:1)
    │     └─ user_id → auth.users.id
    │
    └─→ members (1:N)
          ├─ user_id → auth.users.id
          │
          └─→ health_data (1:N)
                └─ member_id → members.id
```

### Security Considerations

1. **Row-Level Security (RLS)**:
   - All tables have RLS enabled
   - Policies ensure users can only access their own data
   - Foreign key relationships are validated in policies

2. **Authentication**:
   - Uses Supabase Auth with JWT tokens
   - Auto-confirm email enabled for development
   - Session persistence in localStorage

3. **Data Cascade**:
   - Deleting a member cascades to health_data
   - Profile linked to auth.users (handled by Supabase)

4. **SQL Injection Prevention**:
   - All queries use parameterized statements via Supabase client
   - No raw SQL execution from client
   - Edge Functions use Supabase client methods

---

## AI Integration

### Lovable AI Gateway

The application uses the Lovable AI Gateway for AI capabilities, which provides:
- Unified interface to multiple AI models
- Built-in rate limiting and quota management
- No need to manage individual API keys
- Usage-based pricing with free tier

### Model Selection

**Google Gemini 2.5 Flash** is used for all AI operations:

**Characteristics**:
- Fast response times
- Cost-effective for production use
- Excellent for structured output (function calling)
- Strong reasoning capabilities for health analysis
- Supports streaming for chat applications

**Alternatives Available**:
- `google/gemini-2.5-pro`: Higher reasoning capability (slower, more expensive)
- `openai/gpt-5`: Alternative with different strengths
- `openai/gpt-5-mini`: Faster, cheaper OpenAI option

### Structured Output (Function Calling)

For health insights, the system uses function calling to ensure structured, predictable responses:

```typescript
tools: [{
  type: "function",
  function: {
    name: "provide_health_insights",
    description: "Provide health analysis summary and recommendations",
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "A brief summary of current health status"
        },
        recommendation: {
          type: "string",
          description: "Specific actionable recommendations"
        }
      },
      required: ["summary", "recommendation"],
      additionalProperties: false
    }
  }
}]
```

**Benefits**:
- Guaranteed response structure
- Type-safe integration
- Easier error handling
- Consistent UI rendering

### Streaming Responses

The chat assistant uses streaming for better UX:

```typescript
// Server-side (Edge Function)
{
  model: "google/gemini-2.5-flash",
  messages: [...],
  stream: true
}

// Client-side processing
const reader = response.data.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      const content = data.choices[0]?.delta?.content;
      if (content) {
        // Append to message in real-time
        appendToMessage(content);
      }
    }
  }
}
```

### Context Management

The AI assistant maintains context about all monitored members:

```typescript
const systemPrompt = `You are a professional health assistant...

Current Family Members Being Monitored:
${membersContext.map(m => `
- ${m.name} (${m.age} years old, ${m.relationship})
  Health History: ${m.healthHistory}
  Current Vitals: HR ${m.heartRate}, BP ${m.bpSystolic}/${m.bpDiastolic}
`).join('\n')}`;
```

**Context Updates**:
- Refreshed on every new chat message
- Includes latest vitals from simulated real-time data
- Maintains conversation history for follow-up questions

### Rate Limiting & Error Handling

```typescript
// Rate limit (429)
if (response.status === 429) {
  return { 
    error: "Rate limit exceeded. Please try again in a moment." 
  };
}

// Credits depleted (402)
if (response.status === 402) {
  return { 
    error: "AI credits depleted. Please add credits to continue." 
  };
}

// General errors
catch (error) {
  console.error("AI Error:", error);
  toast.error("Failed to generate response");
}
```

---

## Authentication & Security

### Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Email/Password
       ▼
┌─────────────┐
│ Auth.tsx    │
└──────┬──────┘
       │ 2. supabase.auth.signUp/signIn
       ▼
┌─────────────────┐
│ Supabase Auth   │
└──────┬──────────┘
       │ 3. JWT Token
       ▼
┌─────────────┐
│ localStorage│ (Session)
└──────┬──────┘
       │ 4. Auto-redirect
       ▼
┌─────────────┐
│ Dashboard   │
└─────────────┘
```

### Sign Up Implementation

```typescript
const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
      },
    },
  });
  
  if (error) {
    toast.error(error.message);
    return;
  }
  
  // Auto-confirm is enabled, so immediate login
  navigate("/dashboard");
};
```

### Sign In Implementation

```typescript
const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });
  
  if (error) {
    toast.error(error.message);
    return;
  }
  
  navigate("/dashboard");
};
```

### Session Management

```typescript
// Dashboard.tsx - Session check
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    if (!session) {
      navigate("/auth");
    }
  });

  // Listen for auth changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    if (!session) {
      navigate("/auth");
    }
  });

  return () => subscription.unsubscribe();
}, [navigate]);
```

### Sign Out

```typescript
const handleSignOut = async () => {
  await supabase.auth.signOut();
  navigate("/auth");
};
```

### Auto-Confirm Configuration

For development/testing, email auto-confirm is enabled:

```typescript
// Supabase config
{
  auto_confirm_email: true,
  disable_signup: false,
  external_anonymous_users_enabled: false
}
```

**Production Considerations**:
- Disable auto-confirm
- Enable email verification
- Consider OAuth providers (Google, Apple)
- Implement password reset flow
- Add 2FA support

### API Security

**Authenticated Requests**:
```typescript
// Supabase client automatically includes JWT
const { data, error } = await supabase
  .from('members')
  .select('*');
// Token included in Authorization header automatically
```

**Edge Function Security**:
```typescript
// Edge Functions receive user context
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  return new Response('Unauthorized', { status: 401 });
}
```

### Row-Level Security (RLS)

All database operations are protected by RLS policies:

```sql
-- Example: Members table
CREATE POLICY "Users can view their own members"
  ON members FOR SELECT
  USING (auth.uid() = user_id);
```

**Security Benefits**:
- Database-level authorization
- No way to bypass via API
- Automatic enforcement across all queries
- Prevents horizontal privilege escalation

---

## API Documentation

### Supabase REST API

Auto-generated REST API via PostgREST:

#### Base URL
```
https://czyhrylnucsoqgstxtag.supabase.co/rest/v1/
```

#### Authentication
All requests require the `apikey` header or `Authorization: Bearer <jwt>` header.

---

### Members API

#### GET /members
Retrieve all members for authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
apikey: <anon_key>
```

**Response** (200):
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Mary Johnson",
    "age": 78,
    "relationship": "Mother",
    "health_history": "Hypertension, Type 2 Diabetes",
    "device_id": "FitBand 5-abc123",
    "status": "Normal",
    "created_at": "2025-10-01T12:00:00Z",
    "updated_at": "2025-10-04T08:30:00Z"
  }
]
```

#### POST /members
Create a new member

**Request Body**:
```json
{
  "name": "John Doe",
  "age": 82,
  "relationship": "Father",
  "health_history": "Heart disease, arthritis",
  "device_id": "HealthWatch Pro-xyz789"
}
```

**Response** (201):
```json
{
  "id": "new-uuid",
  "user_id": "user-uuid",
  "name": "John Doe",
  "age": 82,
  "relationship": "Father",
  "health_history": "Heart disease, arthritis",
  "device_id": "HealthWatch Pro-xyz789",
  "status": "Normal",
  "created_at": "2025-10-04T10:00:00Z",
  "updated_at": "2025-10-04T10:00:00Z"
}
```

#### PATCH /members?id=eq.<member_id>
Update a member

**Request Body**:
```json
{
  "status": "Alert",
  "health_history": "Updated history..."
}
```

**Response** (200):
```json
{
  "id": "member-uuid",
  "status": "Alert",
  "health_history": "Updated history...",
  "updated_at": "2025-10-04T11:00:00Z"
}
```

#### DELETE /members?id=eq.<member_id>
Delete a member

**Response** (204): No content

---

### Health Data API

#### GET /health_data?member_id=eq.<member_id>
Retrieve health data for a member

**Query Parameters**:
- `order=recorded_at.desc`: Sort by timestamp
- `limit=100`: Limit results

**Response** (200):
```json
[
  {
    "id": "uuid",
    "member_id": "member-uuid",
    "heart_rate": 78,
    "bp_systolic": 125,
    "bp_diastolic": 82,
    "steps": 3542,
    "recorded_at": "2025-10-04T10:00:00Z"
  }
]
```

#### POST /health_data
Insert health data

**Request Body**:
```json
{
  "member_id": "member-uuid",
  "heart_rate": 75,
  "bp_systolic": 120,
  "bp_diastolic": 80,
  "steps": 2000
}
```

**Response** (201):
```json
{
  "id": "new-uuid",
  "member_id": "member-uuid",
  "heart_rate": 75,
  "bp_systolic": 120,
  "bp_diastolic": 80,
  "steps": 2000,
  "recorded_at": "2025-10-04T10:15:00Z"
}
```

---

### Edge Functions API

#### POST /functions/v1/ai-insights
Generate AI health insights

**Request Body**:
```json
{
  "memberData": {
    "name": "Mary Johnson",
    "age": 78,
    "relationship": "Mother",
    "healthHistory": "Hypertension, Type 2 Diabetes",
    "heartRate": 85,
    "bpSystolic": 140,
    "bpDiastolic": 90,
    "steps": 3200
  }
}
```

**Response** (200):
```json
{
  "summary": "Mary's vitals show slightly elevated blood pressure and moderate activity levels. Her heart rate is within normal range for her age.",
  "recommendation": "Monitor blood pressure closely. Encourage continued physical activity. Consider scheduling a check-up if BP remains elevated for 2-3 days."
}
```

**Error Responses**:
- `429`: Rate limit exceeded
- `402`: AI credits depleted
- `500`: Server error

#### POST /functions/v1/ai-chat
Chat with AI health assistant

**Request Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "How is my mother doing today?"
    }
  ],
  "membersContext": [
    {
      "name": "Mary Johnson",
      "age": 78,
      "relationship": "Mother",
      "healthHistory": "Hypertension, Type 2 Diabetes",
      "heartRate": 85,
      "bpSystolic": 140,
      "bpDiastolic": 90,
      "steps": 3200,
      "status": "Normal"
    }
  ]
}
```

**Response**: Server-Sent Events (SSE) stream
```
data: {"choices":[{"delta":{"content":"Based"}}]}

data: {"choices":[{"delta":{"content":" on"}}]}

data: {"choices":[{"delta":{"content":" Mary's"}}]}

data: [DONE]
```

---

## Component Documentation

### UI Component Library

The application uses **shadcn/ui** components, which are built on top of Radix UI primitives and styled with Tailwind CSS.

#### Button Component

```typescript
import { Button } from "@/components/ui/button";

// Variants
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

#### Card Component

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

#### Dialog Component

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

#### Select Component

```typescript
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("Operation successful!");

// Error
toast.error("Something went wrong!");

// Info
toast("Information message");

// Promise-based
toast.promise(
  asyncOperation(),
  {
    loading: 'Loading...',
    success: 'Done!',
    error: 'Failed!'
  }
);
```

### Custom Components

#### MemberCard

**Props**:
```typescript
interface MemberCardProps {
  member: Member;
  isSelected: boolean;
  onClick: () => void;
}
```

**Usage**:
```typescript
<MemberCard
  member={member}
  isSelected={selectedMember?.id === member.id}
  onClick={() => setSelectedMember(member)}
/>
```

#### MemberDetailPanel

**Props**:
```typescript
interface MemberDetailPanelProps {
  member: Member;
  allMembers: Member[];
  onMemberDeleted: () => void;
}
```

**Usage**:
```typescript
<MemberDetailPanel
  member={selectedMember}
  allMembers={members}
  onMemberDeleted={loadMembers}
/>
```

#### AddMemberModal

**Props**:
```typescript
interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (memberData: any) => void;
}
```

**Usage**:
```typescript
<AddMemberModal
  open={isAddModalOpen}
  onOpenChange={setIsAddModalOpen}
  onAdd={handleAddMember}
/>
```

#### HealthAssistant

**Props**:
```typescript
interface HealthAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
}
```

**Usage**:
```typescript
<HealthAssistant
  open={isAssistantOpen}
  onOpenChange={setIsAssistantOpen}
  members={members}
/>
```

---

## Data Flow & Real-time Updates

### Real-time Simulation Architecture

Currently, the application simulates real-time updates for demonstration purposes. In production, this would be replaced with actual device integrations.

#### Simulation Logic

```typescript
// Dashboard.tsx
useEffect(() => {
  if (members.length === 0) return;

  const interval = setInterval(() => {
    setMembers((prevMembers) =>
      prevMembers.map((member) => {
        // Simulate heart rate variation
        const newHeartRate = Math.max(
          60,
          Math.min(100, member.heartRate + (Math.random() - 0.5) * 4)
        );
        
        // Simulate step increments
        const newSteps = member.steps + Math.floor(Math.random() * 15);

        // Random alert trigger (5% chance if HR > 95)
        const shouldAlert = Math.random() < 0.05 && newHeartRate > 95;

        return {
          ...member,
          heartRate: Math.round(newHeartRate),
          steps: newSteps,
          status: shouldAlert ? "Alert" : "Normal",
        };
      })
    );
  }, 5000); // Update every 5 seconds

  return () => clearInterval(interval);
}, [members.length]);
```

### Production Real-time Architecture

For production deployment with actual wearable devices:

#### 1. WebSocket Connection

```typescript
// Real-time data subscription
useEffect(() => {
  const channel = supabase
    .channel('health-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'health_data',
        filter: `member_id=in.(${memberIds.join(',')})`
      },
      (payload) => {
        // Update UI with new health data
        updateMemberVitals(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [memberIds]);
```

#### 2. Device Data Ingestion

```typescript
// Edge Function: ingest-device-data
serve(async (req) => {
  const { deviceId, metrics } = await req.json();
  
  // Validate device ownership
  const { data: member } = await supabase
    .from('members')
    .select('id, user_id')
    .eq('device_id', deviceId)
    .single();
  
  if (!member) {
    return new Response('Device not found', { status: 404 });
  }
  
  // Insert health data
  const { error } = await supabase
    .from('health_data')
    .insert({
      member_id: member.id,
      heart_rate: metrics.heartRate,
      bp_systolic: metrics.bpSystolic,
      bp_diastolic: metrics.bpDiastolic,
      steps: metrics.steps
    });
  
  if (error) throw error;
  
  // Trigger realtime update
  return new Response('Data ingested', { status: 200 });
});
```

#### 3. Third-Party Integrations

**Fitbit Integration Example**:
```typescript
// OAuth flow for Fitbit
const connectFitbit = async (memberId: string) => {
  const redirectUri = `${window.location.origin}/integrations/fitbit/callback`;
  const authUrl = `https://www.fitbit.com/oauth2/authorize?` +
    `response_type=code&` +
    `client_id=${FITBIT_CLIENT_ID}&` +
    `redirect_uri=${redirectUri}&` +
    `scope=heartrate activity sleep`;
  
  window.location.href = authUrl;
};

// Callback handler
const handleFitbitCallback = async (code: string) => {
  // Exchange code for access token (via Edge Function)
  const { data } = await supabase.functions.invoke('fitbit-auth', {
    body: { code }
  });
  
  // Store access token for member
  await supabase
    .from('members')
    .update({ device_id: `fitbit-${data.userId}` })
    .eq('id', memberId);
};
```

### Alert Processing Flow

```
┌──────────────┐
│ New Data     │
│ Ingested     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Check        │ ← Alert Thresholds
│ Thresholds   │   (Heart Rate, BP, etc.)
└──────┬───────┘
       │
       ├─→ Normal: Update UI
       │
       └─→ Alert: 
           ├─→ Update member.status
           ├─→ Trigger notification
           └─→ Update UI with alert banner
```

---

## Deployment & Infrastructure

### Development Environment

**Requirements**:
- Node.js 18+
- npm or pnpm
- Supabase account (for cloud features)

**Setup**:
```bash
# Clone repository
git clone <repository-url>
cd health-guardian

# Install dependencies
npm install

# Set up environment variables
# (Auto-configured with Lovable Cloud)

# Start development server
npm run dev
```

**Environment Variables** (.env):
```
VITE_SUPABASE_URL=https://czyhrylnucsoqgstxtag.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_PROJECT_ID=czyhrylnucsoqgstxtag
```

### Production Deployment

#### Lovable Platform (Recommended)

1. Click "Publish" in Lovable interface
2. Automatic deployment to Lovable hosting
3. Custom domain configuration in Settings > Domains
4. SSL/TLS automatically configured

**Lovable Hosting Benefits**:
- Zero-configuration deployment
- Automatic HTTPS
- Global CDN
- Instant rollback capability
- Preview deployments for testing

#### Self-Hosted Deployment

**Option 1: Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Option 2: Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Option 3: Docker**

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

**Deploy**:
```bash
# Build image
docker build -t health-guardian .

# Run container
docker run -p 8080:80 health-guardian
```

### Edge Functions Deployment

Edge Functions are automatically deployed with the application when using Lovable Cloud.

**For self-hosted Supabase**:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref <project-id>

# Deploy functions
supabase functions deploy ai-insights
supabase functions deploy ai-chat
```

### Database Migrations

**Apply migrations**:
```bash
# Using Supabase CLI
supabase db push

# Or via Supabase Dashboard
# Settings > Database > Migrations
```

**Create new migration**:
```bash
supabase migration new <migration-name>
```

### Monitoring & Logging

**Supabase Dashboard**:
- Database logs: Database > Logs
- Edge Function logs: Edge Functions > <function-name> > Logs
- Auth logs: Authentication > Logs

**Application Monitoring**:
```typescript
// Error tracking (example with Sentry)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "<your-sentry-dsn>",
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Analytics**:
```typescript
// Google Analytics (example)
import ReactGA from "react-ga4";

ReactGA.initialize("G-MEASUREMENT-ID");

// Track page views
useEffect(() => {
  ReactGA.send({ hitType: "pageview", page: location.pathname });
}, [location]);
```

### Performance Optimization

**Production Build**:
```bash
npm run build
```

**Optimizations Applied**:
- Code splitting via dynamic imports
- Tree shaking of unused code
- Asset minification and compression
- CSS extraction and optimization
- Image optimization (if using build plugins)

**CDN Configuration**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'supabase-vendor': ['@supabase/supabase-js'],
        }
      }
    }
  }
});
```

---

## Development Guide

### Local Development Workflow

1. **Start Development Server**:
```bash
npm run dev
# Opens at http://localhost:5173
```

2. **Hot Module Replacement**: Changes are reflected instantly without full page reload

3. **TypeScript Checking**:
```bash
npm run type-check
```

4. **Linting**:
```bash
npm run lint
```

### Code Style Guidelines

**TypeScript**:
- Use explicit types for props and state
- Prefer interfaces over types for object shapes
- Use type inference where appropriate
- Avoid `any` type; use `unknown` if necessary

**React**:
- Functional components with hooks
- Use TypeScript for prop types
- Extract reusable logic into custom hooks
- Keep components focused and small (<200 lines)

**Naming Conventions**:
- Components: PascalCase (`MemberCard.tsx`)
- Functions: camelCase (`handleSubmit`)
- Constants: UPPER_SNAKE_CASE (`AVAILABLE_DEVICES`)
- CSS classes: kebab-case (via Tailwind)

**File Organization**:
```
src/
├── components/
│   ├── ui/          # Reusable UI components
│   └── <Feature>    # Feature-specific components
├── pages/           # Route components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── integrations/    # External service integrations
```

### Adding New Features

#### 1. Add a New Database Table

```sql
-- Create migration
-- supabase/migrations/YYYYMMDD_new_table.sql

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  appointment_date TIMESTAMPTZ NOT NULL,
  doctor_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view appointments for their members"
  ON appointments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.id = appointments.member_id
    AND members.user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2. Create a New Component

```typescript
// src/components/AppointmentCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface Appointment {
  id: string;
  appointment_date: string;
  doctor_name: string;
  notes: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (id: string) => void;
}

const AppointmentCard = ({ appointment, onEdit }: AppointmentCardProps) => {
  const date = new Date(appointment.appointment_date);
  
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEdit(appointment.id)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {date.toLocaleDateString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium">{appointment.doctor_name}</p>
        {appointment.notes && (
          <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
```

#### 3. Add API Integration

```typescript
// src/hooks/useAppointments.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Appointment {
  id: string;
  member_id: string;
  appointment_date: string;
  doctor_name: string;
  notes: string;
}

export const useAppointments = (memberId: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [memberId]);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("member_id", memberId)
        .order("appointment_date", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const addAppointment = async (appointment: Omit<Appointment, "id">) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert([appointment])
        .select()
        .single();

      if (error) throw error;
      setAppointments([...appointments, data]);
      toast.success("Appointment added");
    } catch (error) {
      toast.error("Failed to add appointment");
    }
  };

  return { appointments, isLoading, addAppointment, refreshAppointments: loadAppointments };
};
```

### Testing Guidelines

**Unit Testing** (example with Vitest):

```typescript
// src/components/MemberCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MemberCard from './MemberCard';

describe('MemberCard', () => {
  const mockMember = {
    id: '1',
    name: 'John Doe',
    age: 75,
    relationship: 'Father',
    heartRate: 80,
    steps: 5000,
    status: 'Normal'
  };

  it('renders member information', () => {
    render(<MemberCard member={mockMember} isSelected={false} onClick={vi.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Father, 75 years')).toBeInTheDocument();
    expect(screen.getByText('80 BPM')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<MemberCard member={mockMember} isSelected={false} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('John Doe'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Integration Testing**:

```typescript
// src/pages/Dashboard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

describe('Dashboard', () => {
  it('loads and displays members', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Family Members/i)).toBeInTheDocument();
    });
  });
});
```

### Common Development Tasks

**Add a New Icon**:
```typescript
import { IconName } from "lucide-react";

<IconName className="w-4 h-4 text-primary" />
```

**Add a New Color**:
```css
/* index.css */
:root {
  --custom-color: 180 50% 60%;
}

/* Usage */
<div className="text-custom-color">Content</div>
```

**Add a New Route**:
```typescript
// App.tsx
<Route path="/appointments" element={<AppointmentsPage />} />
```

**Add a New Edge Function**:
```bash
# Create function directory
mkdir -p supabase/functions/my-function

# Create index.ts
```

```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data } = await req.json();
    
    // Your logic here
    
    return new Response(
      JSON.stringify({ result: "success" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

## Appendix

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | `eyJ...` |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | `czyhrylnucsoqgstxtag` |
| `LOVABLE_API_KEY` | Lovable AI Gateway key (server-only) | `sk_lovable_...` |

### Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Type checking
npm run type-check       # Check TypeScript types

# Database
supabase db reset        # Reset local database
supabase db push         # Push migrations
supabase db pull         # Pull schema from remote

# Edge Functions
supabase functions serve # Run functions locally
supabase functions deploy <name> # Deploy function
```

### Third-Party Integrations (Future)

**Fitbit API**:
- OAuth 2.0 authentication
- Webhooks for real-time updates
- API rate limits: 150 requests/hour

**Apple HealthKit**:
- Native iOS integration required
- Uses HealthKit framework
- Real-time data sync

**Google Fit**:
- REST API + OAuth 2.0
- Real-time updates via webhooks
- Cross-platform support

### Compliance Considerations

**HIPAA Compliance** (Health Insurance Portability and Accountability Act):
- Encrypt all data at rest and in transit
- Implement audit logging
- Use Business Associate Agreements (BAA) with vendors
- Regular security assessments

**GDPR Compliance** (General Data Protection Regulation):
- User consent for data collection
- Right to data portability
- Right to be forgotten (data deletion)
- Privacy policy and terms of service

### Support & Resources

**Documentation**:
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Tailwind CSS: https://tailwindcss.com
- Supabase: https://supabase.com/docs
- Lovable: https://docs.lovable.dev

**Community**:
- Lovable Discord: [Join Server]
- GitHub Issues: [Repository Issues]

---

**Document End**

*This documentation is maintained by the development team and should be updated with each major release or architectural change.*
