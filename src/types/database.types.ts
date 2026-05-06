export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          status: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          org_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          org_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          org_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'org_members_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'org_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      org_roles: {
        Row: {
          org_id: string
          role_code: string
          created_at: string
        }
        Insert: {
          org_id: string
          role_code: string
          created_at?: string
        }
        Update: {
          org_id?: string
          role_code?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'org_roles_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'org_roles_role_code_fkey'
            columns: ['role_code']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['code']
          },
        ]
      }
      announcement_comments: {
        Row: {
          announcement_id: string
          content: string
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          content: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          content?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'announcement_comments_announcement_id_fkey'
            columns: ['announcement_id']
            isOneToOne: false
            referencedRelation: 'announcements'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'announcement_comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      announcement_likes: {
        Row: {
          announcement_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'announcement_likes_announcement_id_fkey'
            columns: ['announcement_id']
            isOneToOne: false
            referencedRelation: 'announcements'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'announcement_likes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      announcements: {
        Row: {
          allow_comment: boolean
          content: string
          created_at: string
          created_by: string | null
          expire_at: string | null
          id: string
          pinned: boolean
          priority: string
          publish_at: string | null
          status: string
          summary: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allow_comment?: boolean
          content: string
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          id?: string
          pinned?: boolean
          priority?: string
          publish_at?: string | null
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allow_comment?: boolean
          content?: string
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          id?: string
          pinned?: boolean
          priority?: string
          publish_at?: string | null
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'announcements_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'announcements_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      permissions: {
        Row: {
          code: string | null
          component: string | null
          created_at: string
          icon: string | null
          id: number
          is_external: string | null
          is_hidden: boolean | null
          layout: string | null
          name: string
          parent_id: number | null
          path: string | null
          sort: number | null
          status: boolean | null
          type: string | null
        }
        Insert: {
          code?: string | null
          component?: string | null
          created_at?: string
          icon?: string | null
          id?: number
          is_external?: string | null
          is_hidden?: boolean | null
          layout?: string | null
          name: string
          parent_id?: number | null
          path?: string | null
          sort?: number | null
          status?: boolean | null
          type?: string | null
        }
        Update: {
          code?: string | null
          component?: string | null
          created_at?: string
          icon?: string | null
          id?: number
          is_external?: string | null
          is_hidden?: boolean | null
          layout?: string | null
          name?: string
          parent_id?: number | null
          path?: string | null
          sort?: number | null
          status?: boolean | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'permissions_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'permissions'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          status: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          status?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          status?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          actions: string[] | null
          permission_id: number
          role_code: string
        }
        Insert: {
          actions?: string[] | null
          permission_id: number
          role_code: string
        }
        Update: {
          actions?: string[] | null
          permission_id?: number
          role_code?: string
        }
        Relationships: [
          {
            foreignKeyName: 'role_permissions_permission_id_fkey'
            columns: ['permission_id']
            isOneToOne: false
            referencedRelation: 'permissions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'role_permissions_role_code_fkey'
            columns: ['role_code']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['code']
          },
        ]
      }
      roles: {
        Row: {
          code: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      system_message_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          detail: Json
          id: string
          message_id: string
          recipient_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          message_id: string
          recipient_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          message_id?: string
          recipient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'system_message_logs_actor_user_id_fkey'
            columns: ['actor_user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'system_message_logs_message_id_fkey'
            columns: ['message_id']
            isOneToOne: false
            referencedRelation: 'system_messages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'system_message_logs_recipient_id_fkey'
            columns: ['recipient_id']
            isOneToOne: false
            referencedRelation: 'system_message_recipients'
            referencedColumns: ['id']
          },
        ]
      }
      system_message_recipients: {
        Row: {
          created_at: string
          delivered_at: string | null
          delivery_status: string
          dismissed_at: string | null
          id: string
          message_id: string
          read_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          dismissed_at?: string | null
          id?: string
          message_id: string
          read_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          dismissed_at?: string | null
          id?: string
          message_id?: string
          read_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'system_message_recipients_message_id_fkey'
            columns: ['message_id']
            isOneToOne: false
            referencedRelation: 'system_messages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'system_message_recipients_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      system_messages: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          expire_at: string | null
          id: string
          message_type: string
          payload: Json
          send_at: string | null
          send_status: string
          source_event: string | null
          source_module: string | null
          summary: string | null
          target_role_codes: string[]
          target_type: string
          target_user_ids: string[]
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          id?: string
          message_type?: string
          payload?: Json
          send_at?: string | null
          send_status?: string
          source_event?: string | null
          source_module?: string | null
          summary?: string | null
          target_role_codes?: string[]
          target_type?: string
          target_user_ids?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          id?: string
          message_type?: string
          payload?: Json
          send_at?: string | null
          send_status?: string
          source_event?: string | null
          source_module?: string | null
          summary?: string | null
          target_role_codes?: string[]
          target_type?: string
          target_user_ids?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'system_messages_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      user_roles: {
        Row: {
          role_code: string
          user_id: string
        }
        Insert: {
          role_code: string
          user_id: string
        }
        Update: {
          role_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_role_code_fkey'
            columns: ['role_code']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['code']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dispatch_system_message: { Args: { p_message_id: string }; Returns: number }
      get_user_permissions: {
        Args: never
        Returns: {
          p_code: string
          p_id: number
          p_name: string
          p_parent_id: number
          p_type: string
          p_path: string | null
          p_component: string | null
          p_icon: string | null
          p_is_hidden: boolean
          p_sort: number
          p_layout: string | null
        }[]
      }
      has_roles: { Args: { role_codes: string[] }; Returns: boolean }
      mark_system_message_read: {
        Args: { p_recipient_id: string }
        Returns: {
          created_at: string
          delivered_at: string | null
          delivery_status: string
          dismissed_at: string | null
          id: string
          message_id: string
          read_at: string | null
          updated_at: string
          user_id: string
        }
      }
      publish_announcement: {
        Args: { p_announcement_id: string }
        Returns: {
          allow_comment: boolean
          content: string
          created_at: string
          created_by: string | null
          expire_at: string | null
          id: string
          pinned: boolean
          priority: string
          publish_at: string | null
          status: string
          summary: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
      }
      reorder_permissions: { Args: { updates: Json }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
