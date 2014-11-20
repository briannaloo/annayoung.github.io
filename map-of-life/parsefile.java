import java.io.*;
import java.util.*;

public class parsefile
{
	public static void main(String[] args) throws IOException 
	{
		String file = "updated_biomes.csv";
		String file2 = "updated_pacovw.csv";
		Scanner scan = new Scanner(new File(file));
		PrintWriter data = new PrintWriter("new_pacovw.csv", "UTF-8");
		HashMap<String, String> biomes = new HashMap<String, String>();
		HashMap<String, String> shares = new HashMap<String, String>();
		scan.nextLine();
		while (scan.hasNextLine()) {
			String line = scan.nextLine();
			String[] split = line.split(",");
			String iso = split[0];
			String biome = split[1];
			String share = split[3];
			if (biome != "99") {
				biomes.put(iso + biome, split[2]);
			}
			if (share != "NA") {
				shares.put(iso + biome, share);
			}
		}

		scan = new Scanner(new File(file2));
		String head = scan.nextLine();
		data.print(head);
		while (scan.hasNextLine()) {
			String line = scan.nextLine();
			String split[] = line.split(",");
			String iso = split[0];
			data.print('\n');
			data.print(split[0] + "," + split[1] + "," + split[2] + ",");
			for (int i = 1; i < 15; i++) {
				String result = biomes.get(iso + i);
				if (result != null)
					data.print(result + ",");
				else
					data.print("-1,");
			}

			for (int i = 1; i < 15; i++) {
				String result = shares.get(iso + i);
				if (result != null)
					data.print(result + ",");
				else
					data.print("-1,");
			}
		}
		data.flush();
		data.close();
	}
}