import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  target_role: string | null;
  resume_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedBlueprint {
  id: string;
  user_id: string;
  title: string;
  target_role: string;
  skills_used: Json;
  missing_skills: Json;
  blueprint_data: Json;
  created_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedSkills, setSavedSkills] = useState<string[]>([]);
  const [savedBlueprints, setSavedBlueprints] = useState<SavedBlueprint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchSavedSkills = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("saved_skills")
        .select("skill")
        .eq("user_id", user.id);

      if (error) throw error;
      setSavedSkills(data?.map((s) => s.skill) || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const fetchSavedBlueprints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("saved_blueprints")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedBlueprints(data as SavedBlueprint[] || []);
    } catch (error) {
      console.error("Error fetching blueprints:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchSavedSkills(), fetchSavedBlueprints()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    } else {
      setProfile(null);
      setSavedSkills([]);
      setSavedBlueprints([]);
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (updates: Partial<Pick<Profile, "display_name" | "target_role" | "resume_url">>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      toast({ title: "Profile updated!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  const uploadResume = async (file: File) => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/resume.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get signed URL (valid for 1 year)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);

      if (urlError) throw urlError;

      // Update profile with resume URL
      await updateProfile({ resume_url: filePath });
      
      toast({ title: "Resume uploaded successfully!" });
      return urlData.signedUrl;
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast({ title: "Failed to upload resume", variant: "destructive" });
      return null;
    }
  };

  const deleteResume = async () => {
    if (!user || !profile?.resume_url) return;

    try {
      const { error: deleteError } = await supabase.storage
        .from('resumes')
        .remove([profile.resume_url]);

      if (deleteError) throw deleteError;

      await updateProfile({ resume_url: null });
      toast({ title: "Resume deleted" });
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({ title: "Failed to delete resume", variant: "destructive" });
    }
  };

  const getResumeUrl = async () => {
    if (!user || !profile?.resume_url) return null;

    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(profile.resume_url, 60 * 60); // 1 hour

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error("Error getting resume URL:", error);
      return null;
    }
  };

  const saveSkills = async (skills: string[]) => {
    if (!user) return;

    try {
      // Delete existing skills
      await supabase.from("saved_skills").delete().eq("user_id", user.id);

      // Insert new skills
      if (skills.length > 0) {
        const { error } = await supabase.from("saved_skills").insert(
          skills.map((skill) => ({ user_id: user.id, skill }))
        );
        if (error) throw error;
      }

      setSavedSkills(skills);
      toast({ title: "Skills saved!" });
    } catch (error) {
      console.error("Error saving skills:", error);
      toast({ title: "Failed to save skills", variant: "destructive" });
    }
  };

  const saveBlueprint = async (blueprint: {
    title: string;
    target_role: string;
    skills_used: string[];
    missing_skills: string[];
    blueprint_data: Json;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("saved_blueprints")
        .insert([{
          user_id: user.id,
          title: blueprint.title,
          target_role: blueprint.target_role,
          skills_used: blueprint.skills_used as Json,
          missing_skills: blueprint.missing_skills as Json,
          blueprint_data: blueprint.blueprint_data,
        }])
        .select()
        .single();

      if (error) throw error;

      setSavedBlueprints((prev) => [data as SavedBlueprint, ...prev]);
      toast({ title: "Blueprint saved!" });
      return data;
    } catch (error) {
      console.error("Error saving blueprint:", error);
      toast({ title: "Failed to save blueprint", variant: "destructive" });
    }
  };

  const deleteBlueprint = async (blueprintId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("saved_blueprints")
        .delete()
        .eq("id", blueprintId);

      if (error) throw error;

      setSavedBlueprints((prev) => prev.filter((b) => b.id !== blueprintId));
      toast({ title: "Blueprint deleted" });
    } catch (error) {
      console.error("Error deleting blueprint:", error);
      toast({ title: "Failed to delete blueprint", variant: "destructive" });
    }
  };

  return {
    profile,
    savedSkills,
    savedBlueprints,
    loading,
    updateProfile,
    saveSkills,
    saveBlueprint,
    deleteBlueprint,
    uploadResume,
    deleteResume,
    getResumeUrl,
    refetch: () => Promise.all([fetchProfile(), fetchSavedSkills(), fetchSavedBlueprints()]),
  };
};
