// Types imported but implicitly used in API responses or future typings

const BASE_URL = 'http://localhost:8000/api'; // Adjust port if needed

const getAuthHeaders = (): HeadersInit => {
    const userStr = localStorage.getItem('uiu_auth_user');
    if (userStr) {
        try {
            const token = localStorage.getItem('uiu_auth_token');
            if (token) {
                return { 'Authorization': `Bearer ${token}` };
            }
        } catch (e) {
            console.error("Error parsing user for auth", e);
        }
    }
    return {};
};

export const api = {
    auth: {
        login: async (email: string, password: string) => {
            console.log("Attempting login via API:", `${BASE_URL}/auth/login.php`);
            try {
                const response = await fetch(`${BASE_URL}/auth/login.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                console.log("Login Response Status:", response.status);

                if (!response.ok) {
                    const text = await response.text();
                    console.error("Login Error Body:", text);
                    try {
                        const errorData = JSON.parse(text);
                        throw new Error(errorData.message || 'Login failed');
                    } catch (e) {
                        throw new Error(`Login failed with status ${response.status}: ${text.substring(0, 50)}...`);
                    }
                }

                const data = await response.json();
                console.log("Login Success Data:", data);
                return data;
            } catch (error) {
                console.error("Fetch/Parse Error in api.ts:", error);
                throw error;
            }
        },
        register: async (name: string, email: string, password: string, role: string) => {
            const response = await fetch(`${BASE_URL}/auth/register.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });
            if (!response.ok) throw new Error('Registration failed');
            return response.json();
        }
    },
    posts: {
        list: async (type?: string) => {
            const url = type
                ? `${BASE_URL}/posts/list.php?type=${type}`
                : `${BASE_URL}/posts/list.php`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch posts');
            return response.json();
        },
        create: async (formData: FormData) => {
            const response = await fetch(`${BASE_URL}/posts/create.php`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(), // Don't set Content-Type for FormData, browser does it
                },
                body: formData,
            });
            if (!response.ok) throw new Error('Failed to create post');
            return response.json();
        },
        delete: async (id: string) => {
            const response = await fetch(`${BASE_URL}/posts/delete.php?id=${id}`, {
                method: 'DELETE',
                headers: {
                    ...getAuthHeaders() as any,
                },
            });
            if (!response.ok) throw new Error('Failed to delete post');
            return response.json();
        },
        updateStatus: async (id: string, status: 'pending' | 'approved' | 'rejected') => {
            const response = await fetch(`${BASE_URL}/posts/update_status.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders() as any
                },
                body: JSON.stringify({ id, status }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update status');
            }
            return response.json();
        },
        vote: async (id: string) => {
            const response = await fetch(`${BASE_URL}/posts/vote.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders() as any
                },
                body: JSON.stringify({ post_id: id }),
            });
            if (!response.ok) throw new Error('Failed to vote');
            return response.json();
        },
        incrementView: async (id: string) => {
            const response = await fetch(`${BASE_URL}/posts/increment_view.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id: id }),
            });
            if (!response.ok) throw new Error('Failed to increment view');
            return response.json();
        },
        // User Voting
        voteUser: async (candidateId: string) => {
            const response = await fetch(`${BASE_URL}/users/vote.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders() as any
                },
                body: JSON.stringify({ candidate_id: candidateId }),
            });
            if (!response.ok) throw new Error('Failed to vote for user');
            return response.json();
        },
        getUserVotes: async () => {
            const response = await fetch(`${BASE_URL}/users/votes_list.php`, {
                headers: { ...getAuthHeaders() as any }
            });
            if (!response.ok) throw new Error('Failed to fetch user votes');
            return response.json();
        }
    }
};
